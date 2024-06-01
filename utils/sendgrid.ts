
import sgMail, { ClientResponse, MailDataRequired, ResponseError } from '@sendgrid/mail';

type SendEmailDataType = Omit<MailDataRequired,"from"|"templateId">

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendEmail=async(data: SendEmailDataType | SendEmailDataType[], isMultiple?: boolean, cb?: (err: Error | ResponseError, result: [ClientResponse, {}]) => void)=>{
  const msg = { 
    from: process.env.SENDGRID_SENDER!,
    templateId: process.env.SENDGRID_TEMPLATE_FORGOT_PASSWORD_ID!,
    ...data
  };

  try {    
    await sgMail.send(msg,isMultiple,cb);
  } catch (error) {
    console.error(error);
  }
}

export const sendReservationConfirmEmail=async(data: SendEmailDataType | SendEmailDataType[], isMultiple?: boolean, cb?: (err: Error | ResponseError, result: [ClientResponse, {}]) => void)=>{
  const msg = { 
    from: process.env.SENDGRID_SENDER!,
    templateId: process.env.SENDGRID_TEMPLATE_RESERVATION_CONFIRMATION_ID!,
    ...data
  };

  try {    
    await sgMail.send(msg,isMultiple,cb);
  } catch (error) {
    console.error(error);
  }
}