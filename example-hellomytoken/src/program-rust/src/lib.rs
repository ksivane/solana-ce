use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

/// Define the type of state stored in accounts
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct GreetingAccount {
    /// number of greetings
    pub counter: u32,
    pub d_counter: u32,
}

// #[derive(BorshSerialize, BorshDeserialize, Debug)]
// pub struct Params {
//     pub supply: u64,
//     pub shipment: u32,
//     pub code: [u8; 3],
//     pub des: [u8; 16],
// }

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Params {
    pub supply: u64,
    pub shipment: u16,
    pub code: String,
    pub des: String,
    pub arr8: [u8; 3],
    //pub sarr: [String; 2], // error: says borsh not implemented for String[]
}


// Declare and export the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey, // Public key of the account the hello token program was loaded into
    accounts: &[AccountInfo], // The account to say hello to
    instruction_data: &[u8], // Ignored, all hellotoken instructions are hellos
) -> ProgramResult {
    msg!("Hello Token Rust program entrypoint (1)");

    // Iterating accounts is safer then indexing
    let accounts_iter = &mut accounts.iter();

    // Get the account to say hello to
    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("Greeted account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    let decoded_params = Params::try_from_slice(instruction_data).unwrap();
    msg!("Decoded data: {:?}", decoded_params);
    msg!("Supply: {}, Shipment: {}", decoded_params.supply, decoded_params.shipment);
    msg!("Code: {}, Description: {}", decoded_params.code, decoded_params.des);
    msg!("Arr8: {:?}", decoded_params.arr8);


    // let code = String::from_utf8(decoded_params.code.to_vec()).unwrap();
    // let des = String::from_utf8(decoded_params.des.to_vec()).unwrap();

    // msg!("Total supply: {}, Code: {}, Description: {}", decoded_params.supply, code, des);
    // msg!("Shipment: {}", decoded_params.shipment);





    // let decoded_params = Params::try_from_slice(instruction_data).unwrap();
    // msg!("Decoded data: {:?}", decoded_params);

    // let code = String::from_utf8(decoded_params.code.to_vec()).unwrap();
    // let des = String::from_utf8(decoded_params.des.to_vec()).unwrap();

    // msg!("Total supply: {}, Code: {}, Description: {}", decoded_params.supply, code, des);
    // msg!("Shipment: {}", decoded_params.shipment);


    // Increment and store the number of times the account has been greeted
    let mut greeting_account = GreetingAccount::try_from_slice(&account.data.borrow())?;
    greeting_account.counter += 1;
    greeting_account.d_counter = greeting_account.counter * 2;
    greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?;

    msg!("Greeted a total {}, {} time(s)!", greeting_account.counter, greeting_account.d_counter);

    Ok(())
}

// Sanity tests
#[cfg(test)]
mod test {
    use super::*;
    use solana_program::clock::Epoch;
    use std::mem;

    #[test]
    fn test_sanity() {
        let program_id = Pubkey::default();
        let key = Pubkey::default();
        let mut lamports = 0;
        let mut data = vec![0; mem::size_of::<u32>()];
        let owner = Pubkey::default();
        let account = AccountInfo::new(
            &key,
            false,
            true,
            &mut lamports,
            &mut data,
            &owner,
            false,
            Epoch::default(),
        );
        let instruction_data: Vec<u8> = Vec::new();

        let accounts = vec![account];

        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            0
        );
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            1
        );
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            2
        );
    }
}
