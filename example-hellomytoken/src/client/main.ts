/**
 * Hello mytoken
 */

import {
  establishConnection,
  establishPayer,
  checkProgram,
  sayHello,
  reportComponent,
} from './hello_mytoken';

async function main() {
  console.log("Let's say hello to a Solana account...");

  // Establish connection to the cluster
  await establishConnection();

  // Determine who pays for the fees
  await establishPayer();

  // Check if the program has been deployed
  await checkProgram();

  // Say hello to an account
  await sayHello();

  // Find out how many times that account has been greeted
  await reportComponent();

  console.log('Success');
}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);
