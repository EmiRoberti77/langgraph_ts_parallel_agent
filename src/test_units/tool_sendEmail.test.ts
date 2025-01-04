import { post } from "../tools/fetch_data";
import { BookingEmail } from "../types";
import dotenv from "dotenv";
dotenv.config();
describe("testing sening email", () => {
  let ses_endpoint: string;
  beforeAll(() => {
    ses_endpoint = process.env.SES_API_ENDPOINT!;
  });
  test("send confirmation email", async () => {
    expect(ses_endpoint).toBeDefined();
    const bookingRef = Math.floor(Math.random() * 1000);
    const timeStamp = new Date().toISOString();
    //send booking email
    const emailConfirmation: BookingEmail = {
      to: ["emiroberti@icloud.com"],
      from: "emiroberti@icloud.com",
      subject: "New Booking " + bookingRef,
      body: "rebooked",
    };
    const emailSent = await post(ses_endpoint, emailConfirmation);
    expect(emailSent.success).toBeTruthy();
    console.log(emailSent);
  });
});
