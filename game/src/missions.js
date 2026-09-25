export const ROUTES={
 blacksite:[
  {kind:'reach',title:'REACH THE SECURITY PERIMETER',pos:[0,0,9.8]},
  {kind:'combat',title:'ELIMINATE THE PATROL',kills:2},
  {kind:'interact',title:'ACCESS THE AEGIS TERMINAL',pos:[-6.5,0,.3],text:'SYSTEM: Credential recognized — E. Kane. DANIEL: No. Kane is dead.'},
  {kind:'hold',title:'RECOVER THE MISSING DATA',pos:[-6.5,0,.3],seconds:8},
  {kind:'combat',title:'SURVIVE THE COUNTERATTACK',kills:4},
  {kind:'extract',title:'REACH EXTRACTION'}],
 refinery:[
  {kind:'combat',title:'INFILTRATE THE REFINERY',kills:2},
  {kind:'interact',title:'DISABLE THE WEST RELAY',pos:[-10,0,3],text:'Relay one isolated. AEGIS fragments are moving through the fuel network.'},
  {kind:'interact',title:'DISABLE THE EAST RELAY',pos:[10,0,-5],text:'A familiar voice: Hold the line, Echo. Daniel: Where did that recording come from?'},
  {kind:'combat',title:'ELIMINATE THE HEAVY GUNNER',kills:6},
  {kind:'interact',title:'SABOTAGE FUEL CONTROLS',pos:[0,0,-15],text:'Fuel cascade initiated. Get clear of the refinery.'},
  {kind:'extract',title:'ESCAPE BEFORE DETONATION',deadline:55}],
 command:[
  {kind:'combat',title:'CLEAR THE OPERATIONS FLOOR',kills:3},
  {kind:'interact',title:'RESCUE THE AEGIS ENGINEER',pos:[-10,0,5],text:'ENGINEER: Reyes is alive in the transfer records. Cover me while I decrypt them.'},
  {kind:'hold',title:'DEFEND THE ENGINEER',pos:[-10,0,5],seconds:18,kills:5},
  {kind:'combat',title:'SECURE THE COMMAND CENTER',kills:7},
  {kind:'interact',title:'RECOVER THE REYES RECORD',pos:[0,0,-15],text:'VISUAL IDENTIFICATION: ELIAS KANE. Reyes transfer destination is encrypted.'},
  {kind:'extract',title:'EXTRACT THE RECORDING'}],
 lab:[
  {kind:'interact',title:'RESTORE AUXILIARY POWER',pos:[0,0,8],text:'AEGIS: Auxiliary power restored. Security lockdown active.'},
  {kind:'combat',title:'CLEAR THE LABORATORY',kills:4},
  {kind:'interact',title:'DISABLE VAULT SECURITY',pos:[-10,0,-5],text:'KANE: You should have stayed away, Daniel.'},
  {kind:'combat',title:'BREACH THE AEGIS CORE',kills:8},
  {kind:'boss',title:'CONFRONT ELIAS KANE'},
  {kind:'interact',title:'ISOLATE THE AEGIS CORE',pos:[0,0,-15],text:'KANE: AEGIS writes the orders. Maya found an override. Her signal is still out there.'},
  {kind:'extract',title:'ESCAPE THE VAULT'}]
};
export const TRAINING=['MOVE','LOOK','AIM','FIRE','RELOAD','SWITCH WEAPON','SPRINT','CROUCH','JUMP','INTERACT','GRENADE','MEDKIT','MAP / OBJECTIVE','PAUSE'];
