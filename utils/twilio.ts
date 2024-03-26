import twilio from 'twilio';


const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)

export const sendSMSTwilio=async(to:string, body:string)=>{
  const msgConfig = {
    body,
    to,
    from: process.env.TWILIO_NUMBER
  }
  try {    
    await client.messages.create(msgConfig)
  } catch (error) {
    console.log("error=>",error)
  }
}