import dotenv from "dotenv";
import { StateAnnotations } from "../agent";
import { get } from "./fetch_data";
import { PNR, PNRAssociation } from "../types";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { NodeInterrupt } from "@langchain/langgraph";
dotenv.config();
const pnr_endpoint = process.env.PNR_API_MOCK!;
const T = (passenger: string) =>
  `flight delayed coming from 'CDG' for ${passenger} he needs to land into London, get me best flight and hotel and display the client data into a table stype format`;

export async function extract_passenger_pnr(
  _state: typeof StateAnnotations.State
) {
  const pnr = _state.pnr.content as string;
  _state.instructions;
  const pnrFound = await extract_passenger_from_pnr(pnr);
  if (!pnrFound) {
    throw new NodeInterrupt("Could not find passenger for this pnr:" + pnr);
  }

  const instruction = build_instruction_prompt(pnrFound.name);
  //update graph state
  return {
    passenger: new AIMessage({
      content: pnrFound.name,
    }),
    instructions: new HumanMessage({
      content: instruction,
    }),
  };
}

export async function extract_passenger_from_pnr(
  pnr: string
): Promise<PNR | undefined> {
  const pnrAssociations: PNRAssociation = await get<PNRAssociation>(
    pnr_endpoint
  );
  //get passenger name from pnr
  const pnrFound = pnrAssociations.pnr_associations.find(
    (item) => item.pnr === pnr
  );
  return pnrFound;
}

export function build_instruction_prompt(passenger: string) {
  return T(passenger);
}
