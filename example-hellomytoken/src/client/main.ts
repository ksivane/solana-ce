/**
 * Hello mytoken
 */

import {
  establishConnection,
  establishPayer,
  checkProgram,
  createComponentQcom,
  updateComponentQcom,
  reportComponentQcom,
  createComponentNvd,
  updateComponentNvd,
  reportComponentNvd,
  addAsChild,
  burnQcom,
} from './hello_mytoken';

async function main() {
  console.log("Let's say hello to a Solana account...");

  console.log("--------------------------- Setup -----------------------------------------")
  // Establish connection to the cluster
  await establishConnection();
  // Determine who pays for the fees
  await establishPayer();
  // Check if the program has been deployed
  await checkProgram();
 
  console.log("--------------------------- Mint Component Qcom ----------------------------")
  // create component of an account
  await createComponentQcom();
  // retrieve latest component info from ledger
  // await reportComponentQcom();
  
  console.log("--------------------------- Update Component Qcom --------------------------")
  // update component of an account
  await updateComponentQcom();
  
  console.log("--------------------------- Read Component Qcom from ledger ----------------")
  // retrieve latest component info from ledger
  await reportComponentQcom();

  console.log("--------------------------- Mint Component Nvd -----------------------------")
  // create component of an account
  await createComponentNvd();
  // retrieve latest component info from ledger
  //await reportComponentNvd();

  console.log("--------------------------- Update Component Nvd ----------------------------")
  // update component of an account
  await updateComponentNvd();

  console.log("--------------------------- Read Component Nvd from ledger ------------------")
  // retrieve latest component info from ledger
  await reportComponentNvd();

  console.log("--------------------------- Add Qcom as child of Nvd ------------------------")
  // add component as child of another
  await addAsChild();

  console.log("--------------------------- Read both Components from ledger ----------------")
  // retrieve latest component info from ledger
  await reportComponentNvd();
  await reportComponentQcom();

  console.log("--------------------------- Burn Qcom ----------------------------------------")
  // recycle component
  await burnQcom();

  console.log("--------------------------- Read Component Qcom from ledger ----------------")
  // retrieve latest component info from ledger
  await reportComponentQcom();


  console.log('\nAll done');
}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);
