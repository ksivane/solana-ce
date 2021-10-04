/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import fs from 'mz/fs';
import path from 'path';
import * as borsh from 'borsh';

import {getPayer, getRpcUrl, createKeypairFromFile} from './utils';

/**
 * Connection to the network
 */
let connection: Connection;

/**
 * Keypair associated to the fees' payer
 */
let payer: Keypair;

/**
 * Hello mytoken's program id
 */
let programId: PublicKey;

/**
 * The public key of the account we are saying hello to
 */
let greetedPubkey: PublicKey;

/**
 * Path to program files
 */
const PROGRAM_PATH = path.resolve(__dirname, '../../dist/program');

/**
 * Path to program shared object file which should be deployed on chain.
 * This file is created when running either:
 *   - `npm run build:program-c`
 *   - `npm run build:program-rust`
 */
const PROGRAM_SO_PATH = path.join(PROGRAM_PATH, 'hellomytoken.so');

/**
 * Path to the keypair of the deployed program.
 * This file is created when running `solana program deploy dist/program/hellomytoken.so`
 */
const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, 'hellomytoken-keypair.json');

/**
 * The state of a greeting account managed by the hello mytoken program
 */
// class GreetingAccount {
//   counter = 0;
//   d_counter = 0;
//   constructor(fields: {counter: number, d_counter: number} | undefined = undefined) {
//     if (fields) {
//       this.counter = fields.counter;
//       this.d_counter = fields.d_counter;
//     }
//   }
// }

class Component {
  id = 0;       // u8 as defined in schema
  description = '';
  serial_no = '';
  parent = 0;   // u8
  children = new Uint8Array(10); // only fixed size supported by borsh

  constructor(fields: {id: number, description: string, serial_no: string, parent: number, children: Uint8Array} | undefined = undefined) {
    if (fields) {
      this.id = fields.id;
      this.description = fields.description;
      this.serial_no = fields.serial_no;
      this.parent = fields.parent;
      this.children = fields.children;
    }
  }
}

const ComponentSchema = new Map([
  [Component, {kind: 'struct', fields: [
    ['id', 'u8'],  // types must match that in program
    ['description', 'string'],
    ['serial_no', 'string'],
    ['parent', 'u8'],
    ['children', [10]],
  ]}],
]);


/**
 * Borsh schema definition for greeting accounts
 */
// const GreetingSchema = new Map([
//   [GreetingAccount, {kind: 'struct', fields: [['counter', 'u32'],['d_counter', 'u32']]}],
// ]);


/**
 * The expected size of each greeting account.
 */
const COMPONENT_SIZE = borsh.serialize(
  ComponentSchema,
  new Component(),
).length;

/**
 * Establish a connection to the cluster
 */
export async function establishConnection(): Promise<void> {
  const rpcUrl = await getRpcUrl();
  connection = new Connection(rpcUrl, 'confirmed');
  const version = await connection.getVersion();
  console.log('Connection to cluster established:', rpcUrl, version);
}

/**
 * Establish an account to pay for everything
 */
export async function establishPayer(): Promise<void> {
  let fees = 0;
  if (!payer) {
    const {feeCalculator} = await connection.getRecentBlockhash();

    // Calculate the cost to fund the greeter account
    fees += await connection.getMinimumBalanceForRentExemption(COMPONENT_SIZE);

    // Calculate the cost of sending transactions
    fees += feeCalculator.lamportsPerSignature * 100; // wag

    payer = await getPayer();
  }

  let lamports = await connection.getBalance(payer.publicKey);
  if (lamports < fees) {
    // If current balance is not enough to pay for fees, request an airdrop
    const sig = await connection.requestAirdrop(
      payer.publicKey,
      fees - lamports,
    );
    await connection.confirmTransaction(sig);
    lamports = await connection.getBalance(payer.publicKey);
  }

  console.log(
    'Using account',
    payer.publicKey.toBase58(),
    'containing',
    lamports / LAMPORTS_PER_SOL,
    'SOL to pay for fees',
  );
}

/**
 * Check if the hello mytoken BPF program has been deployed
 */
export async function checkProgram(): Promise<void> {
  // Read program id from keypair file
  try {
    const programKeypair = await createKeypairFromFile(PROGRAM_KEYPAIR_PATH);
    programId = programKeypair.publicKey;
  } catch (err) {
    const errMsg = (err as Error).message;
    throw new Error(
      `Failed to read program keypair at '${PROGRAM_KEYPAIR_PATH}' due to error: ${errMsg}. Program may need to be deployed with \`solana program deploy dist/program/hellomytoken.so\``,
    );
  }

  // Check if the program has been deployed
  const programInfo = await connection.getAccountInfo(programId);
  if (programInfo === null) {
    if (fs.existsSync(PROGRAM_SO_PATH)) {
      throw new Error(
        'Program needs to be deployed with `solana program deploy dist/program/hellomytoken.so`',
      );
    } else {
      throw new Error('Program needs to be built and deployed');
    }
  } else if (!programInfo.executable) {
    throw new Error(`Program is not executable`);
  }
  console.log(`Using program ${programId.toBase58()}`);

  // Derive the address (public key) of a greeting account from the program so that it's easy to find later.
  const COMPONENT_SEED = 'hello-component';
  greetedPubkey = await PublicKey.createWithSeed(
    payer.publicKey,
    COMPONENT_SEED,
    programId,
  );

  // Check if the greeting account has already been created
  const greetedAccount = await connection.getAccountInfo(greetedPubkey);
  if (greetedAccount === null) {
    console.log(
      'Creating account',
      greetedPubkey.toBase58(),
      'to store component',
      'with storage size: ',
      COMPONENT_SIZE
    );
    const lamports = await connection.getMinimumBalanceForRentExemption(
      COMPONENT_SIZE,
    );

    const transaction = new Transaction().add(
      SystemProgram.createAccountWithSeed({
        fromPubkey: payer.publicKey,
        basePubkey: payer.publicKey,
        seed: COMPONENT_SEED,
        newAccountPubkey: greetedPubkey,
        lamports,
        space: COMPONENT_SIZE,
        programId,
      }),
    );
    await sendAndConfirmTransaction(connection, transaction, [payer]);
  }
}

/**
 * Say hello
 */
export async function sayHello(): Promise<void> {
  console.log('Saying hello to', greetedPubkey.toBase58());

  let this_component = new Component()
  this_component.id = 10;
  this_component.description = 'Qualcom Cpu';
  this_component.serial_no = 'QPU-QWE-100098'
  
  let this_component_s = borsh.serialize(
    ComponentSchema,
    this_component,
  );

  const instruction = new TransactionInstruction({
    keys: [{pubkey: greetedPubkey, isSigner: false, isWritable: true}],
    programId,
    data: Buffer.from(this_component_s),
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [payer],
  );
}

/**
 * Report the number of times the greeted account has been said hello to
 */
export async function reportComponent(): Promise<void> {
  const accountInfo = await connection.getAccountInfo(greetedPubkey);
  if (accountInfo === null) {
    throw 'Error: cannot find the greeted account';
  }
  const component = borsh.deserialize(
    ComponentSchema,
    Component,
    accountInfo.data,
  );
  console.log(
    'Account:',
    greetedPubkey.toBase58(),
    'ID:',
    component.id,
    'Description:',
    component.description,
    'Serial No.:',
    component.serial_no,
    'Parent:',
    component.parent,
    'Children:',
    component.children,
  );
}
