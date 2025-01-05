import { NodeInterrupt } from "@langchain/langgraph";
import { StateAnnotations } from "../agent";
import dotenv from "dotenv";
import { post } from "./fetch_data";
import { BookingEmail } from "../types";
import { AIMessage } from "@langchain/core/messages";
dotenv.config();
const ses_endpoint = process.env.SES_API_ENDPOINT!;

export async function booking_confirmed_tool(
  _state: typeof StateAnnotations.State
) {
  const answer = _state.answer;
  if (!_state.confirmBooking) {
    _state.confirmBooking = true;
    throw new NodeInterrupt(
      "Please confirm you want to proceed with flight and hotel bookings"
    );
  }

  const bookingRef = Math.floor(Math.random() * 1000);
  const timeStamp = new Date().toISOString();
  const bookingContent = `bookingStatus:success bookingReference:${bookingRef} PNR:${_state.pnr.content} passenger:${_state.passenger.content} timeStamp:${timeStamp} `;
  //send booking email
  const emailConfirmation: BookingEmail = {
    to: ["emiroberti@icloud.com"],
    from: "emiroberti@icloud.com",
    subject: "easyJet holiday change" + bookingRef,
    body: bookingContent,
  };

  const emailSent = await post(ses_endpoint, emailConfirmation);
  return {
    messages: new AIMessage({
      content: JSON.stringify(emailSent),
    }),
    confirmBooking: true,
    bookingCompleted: new AIMessage({
      content: bookingContent,
    }),
  };
}
