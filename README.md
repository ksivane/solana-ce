# solana-ce
Solana hackathon

# Circular Economy
## Frontend<->Program (Smart contract) interaction

### Initialization
Pre-requisites (found in the prerequisite folder)
- config.yaml. Configuration file. To be placed as <user's-home-folder>/.config/solana/cli/config.yaml
- id.json. Payer wallet filled with SOL tokens. To be placed as <user's-home-folder>/.config/solana/id.json
- *-keypair.json. Program key file to derive program_id from. To be placed as dist/program/*-keypair.json

Pre-requisites (to be generated at runtime)
- For each component (e.g. LED-display, Pcb, Phone etc.), an address called PDA (Program derived address) has to be created and registsred on Solana. This PDA will be used as the address of the component when component is minted on Solana.
  - For each component, use a different seed to derive unique PDAs.
  - See code lines 191 - 224 in hello_mytoken.ts on how PDAs are generated and regsistered with Solana.
- Once PDAs are created, maintain a mapping of component_id <-> PDA in frontend state.
  - e.g. 100: CojemWZsWiYng8vd7ghVeUWaz5MsNkRygosbdaEBouwv, 200: ByUBFLZKWo6xCv5w3m5vaF9ioUyuQJfi6CR94kvhPxGc



