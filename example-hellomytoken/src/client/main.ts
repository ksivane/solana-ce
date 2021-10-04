/**
 * Hello mytoken
 */

import {
  establishConnection,
  establishPayer,
  checkProgram,
  createComponent,
  updateComponent,
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

  // create component of an account
  await createComponent();

  // retrieve latest component info from ledger
  await reportComponent();

  // create component of an account
  await updateComponent();

  // retrieve latest component info from ledger
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
