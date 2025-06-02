
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface AppointmentConfirmationEmailProps {
  customerName?: string
  appointmentDate: string
  appointmentTime: string
  companyName?: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
}

export const AppointmentConfirmationEmail = ({
  customerName = "Kunde",
  appointmentDate,
  appointmentTime,
  companyName = "Ihr Beratungsunternehmen",
  companyAddress = "Musterstraße 123, 12345 Musterstadt",
  companyPhone = "+49 123 456789",
  companyEmail = "info@beispiel.de",
}: AppointmentConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Terminbestätigung für Ihren Beratungstermin</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Terminbestätigung</Heading>
        
        <Text style={text}>
          Lieber {customerName},
        </Text>
        
        <Text style={text}>
          vielen Dank für Ihre Terminbuchung. Hiermit bestätigen wir Ihren Beratungstermin:
        </Text>
        
        <Section style={appointmentDetails}>
          <Text style={detailsHeading}>Termindetails:</Text>
          <Text style={detailsText}>
            <strong>Datum:</strong> {appointmentDate}<br />
            <strong>Uhrzeit:</strong> {appointmentTime}<br />
            <strong>Dauer:</strong> ca. 60 Minuten
          </Text>
        </Section>
        
        <Section style={companyDetails}>
          <Text style={detailsHeading}>Kontaktdaten:</Text>
          <Text style={detailsText}>
            <strong>{companyName}</strong><br />
            {companyAddress}<br />
            Telefon: {companyPhone}<br />
            E-Mail: <Link href={`mailto:${companyEmail}`} style={link}>{companyEmail}</Link>
          </Text>
        </Section>
        
        <Text style={text}>
          Sollten Sie den Termin nicht wahrnehmen können, bitten wir Sie, uns mindestens 24 Stunden 
          vorher zu informieren.
        </Text>
        
        <Text style={text}>
          Wir freuen uns auf das Gespräch mit Ihnen!
        </Text>
        
        <Text style={text}>
          Mit freundlichen Grüßen,<br />
          Ihr Team von {companyName}
        </Text>
        
        <Text style={footer}>
          Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default AppointmentConfirmationEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
}

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
}

const appointmentDetails = {
  backgroundColor: '#f6f9fc',
  border: '1px solid #e1e8ed',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const companyDetails = {
  backgroundColor: '#f9f9f9',
  border: '1px solid #e1e8ed',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const detailsHeading = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const detailsText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const link = {
  color: '#2754C5',
  textDecoration: 'underline',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '32px',
}
