use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Component {
    pub opcode: u8,
    pub id: u8,
    // pub description: String,
    pub description: [u8; 64],
    // pub serial_no: String,
    pub serial_no: [u8; 16],
    pub parent: u8,
    pub children: [u8; 10],
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

    let decoded_component = Component::try_from_slice(instruction_data).unwrap();
    msg!("Decoded component: {:?}", decoded_component);
    msg!("ID: {}, Description: {:?}", decoded_component.id, decoded_component.description);
    msg!("Serial No.: {:?}, Parent: {}", decoded_component.serial_no, decoded_component.parent);
    msg!("Children: {:?}", decoded_component.children);
    msg!("Opcode: {}", decoded_component.opcode);

    match decoded_component.opcode {
        100 => {
            msg!("Opcode: 100 <Create component>");
            
            let mut component = Component::try_from_slice(&account.data.borrow())?;
            
            component.id = decoded_component.id;
            component.description = decoded_component.description;
            component.serial_no = decoded_component.serial_no;
            component.parent = decoded_component.parent;
            component.children = decoded_component.children;
            component.opcode = decoded_component.opcode;
            
            component.serialize(&mut &mut account.data.borrow_mut()[..])?;

            msg!("Created component. ID: {}, Description: {:?}", component.id, component.description);
            msg!("Serial No: {:?}, Parent: {}", component.serial_no, component.parent);
            msg!("Opcode: {}", component.opcode);
        }

        101 => {
            msg!("Opcode: 101 <Update component>");
            
            let mut component = Component::try_from_slice(&account.data.borrow())?;
            
            component.description = decoded_component.description;
            component.parent = decoded_component.parent;
            component.children = decoded_component.children;
            component.opcode = decoded_component.opcode;
            
            component.serialize(&mut &mut account.data.borrow_mut()[..])?;

            msg!("Updated component. ID: {}, Description: {:?}", component.id, component.description);
            msg!("Serial No: {:?}, Parent: {}", component.serial_no, component.parent);
            msg!("Opcode: {}", component.opcode);
        }

        102 => {
            msg!("Opcode: 102 <Add as child>");
            
            let mut component_child = Component::try_from_slice(&account.data.borrow())?;
            let account_parent = next_account_info(accounts_iter)?;
            let mut component_parent = Component::try_from_slice(&account_parent.data.borrow())?;

            component_child.parent = component_parent.id;
            component_parent.children[0] = component_child.id;
            component_parent.opcode = decoded_component.opcode;
            component_child.opcode = decoded_component.opcode;
            
            component_child.serialize(&mut &mut account.data.borrow_mut()[..])?;
            component_parent.serialize(&mut &mut account_parent.data.borrow_mut()[..])?;

            msg!("Updated component. ID: {}, Description: {:?}", component_child.id, component_child.description);
            msg!("Serial No: {:?}, Parent: {}", component_child.serial_no, component_child.parent);
            msg!("Opcode: {}", component_child.opcode);

            msg!("Updated component. ID: {}, Description: {:?}", component_parent.id, component_parent.description);
            msg!("Serial No: {:?}, Parent: {}", component_parent.serial_no, component_parent.parent);
            msg!("Opcode: {}", component_parent.opcode);
        }

        _ => {
            msg!("Unknown opcode");
        }
    };

    

    


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
