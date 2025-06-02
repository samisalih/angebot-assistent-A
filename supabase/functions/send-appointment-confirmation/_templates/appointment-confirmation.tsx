
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
  companyName = "Digitalwert GmbH",
  companyAddress = "Alaunstr. 9, 01099 Dresden",
  companyPhone = "+49 351 456789",
  companyEmail = "service@digitalwert.de",
}: AppointmentConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Terminbestätigung für Ihren Beratungstermin</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header Section */}
        <Section style={header}>
          <Heading style={h1}>✅ Terminbestätigung</Heading>
        </Section>
        
        {/* Greeting */}
        <Text style={greeting}>
          Hallo {customerName},
        </Text>
        
        <Text style={text}>
          vielen Dank für Ihre Terminbuchung! Wir freuen uns auf unser Gespräch.
        </Text>
        
        {/* Appointment Details Card */}
        <Section style={appointmentCard}>
          <Heading style={cardHeading}>📅 Ihre Termindetails</Heading>
          <div style={detailsGrid}>
            <div style={detailRow}>
              <Text style={detailLabel}>Datum:</Text>
              <Text style={detailValue}>{appointmentDate}</Text>
            </div>
            <div style={detailRow}>
              <Text style={detailLabel}>Uhrzeit:</Text>
              <Text style={detailValue}>{appointmentTime}</Text>
            </div>
            <div style={detailRow}>
              <Text style={detailLabel}>Dauer:</Text>
              <Text style={detailValue}>ca. 60 Minuten</Text>
            </div>
          </div>
        </Section>
        
        {/* Company Contact Card */}
        <Section style={contactCard}>
          <Heading style={cardHeading}>🏢 Kontaktdaten</Heading>
          <Text style={companyInfo}>
            <strong>{companyName}</strong><br />
            📍 {companyAddress}<br />
            📞 {companyPhone}<br />
            ✉️ <Link href={`mailto:${companyEmail}`} style={emailLink}>{companyEmail}</Link>
          </Text>
        </Section>
        
        {/* Important Note */}
        <Section style={noteSection}>
          <Text style={noteText}>
            <strong>📝 Wichtiger Hinweis:</strong><br />
            Sollten Sie den Termin nicht wahrnehmen können, bitten wir Sie, uns mindestens 24 Stunden vorher zu informieren.
          </Text>
        </Section>
        
        {/* Closing */}
        <Text style={closing}>
          Wir freuen uns darauf, Sie kennenzulernen!
        </Text>
        
        <Text style={signature}>
          Mit freundlichen Grüßen,<br />
          <strong>Ihr Team von {companyName}</strong>
        </Text>
        
        {/* Footer */}
        <Section style={footerSection}>
          <Text style={footer}>
            Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default AppointmentConfirmationEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const h1 = {
  color: '#1a202c',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
}

const greeting = {
  color: '#2d3748',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px 0',
}

const text = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const appointmentCard = {
  backgroundColor: '#ffffff',
  border: '2px solid #38a169',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
}

const contactCard = {
  backgroundColor: '#ffffff',
  border: '2px solid #3182ce',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
}

const cardHeading = {
  color: '#1a202c',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
}

const detailsGrid = {
  width: '100%',
}

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '1px solid #e2e8f0',
}

const detailLabel = {
  color: '#718096',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const detailValue = {
  color: '#2d3748',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
}

const companyInfo = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
}

const emailLink = {
  color: '#3182ce',
  textDecoration: 'underline',
}

const noteSection = {
  backgroundColor: '#fef5e7',
  border: '1px solid #f6ad55',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
}

const noteText = {
  color: '#744210',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const closing = {
  color: '#2d3748',
  fontSize: '16px',
  fontWeight: '600',
  margin: '24px 0 16px 0',
}

const signature = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0 32px 0',
}

const footerSection = {
  borderTop: '1px solid #e2e8f0',
  paddingTop: '16px',
  marginTop: '32px',
}

const footer = {
  color: '#a0aec0',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  margin: '0',
}
