
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
    <Head>
      <link href="https://fonts.googleapis.com/css2?family=Titillium+Web:wght@300;400;600;700&display=swap" rel="stylesheet" />
    </Head>
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

// Light mode styles with Titillium Web font and accent color
const main = {
  backgroundColor: '#f8f9fa',
  fontFamily: 'Titillium Web, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
  color: '#1a202c',
}

const container = {
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const h1 = {
  color: '#1a202c',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0',
  textAlign: 'center' as const,
  fontFamily: 'Titillium Web, sans-serif',
}

const greeting = {
  color: '#1a202c',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px 0',
  fontFamily: 'Titillium Web, sans-serif',
}

const text = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  fontFamily: 'Titillium Web, sans-serif',
}

const appointmentCard = {
  backgroundColor: '#ffffff',
  border: '2px solid #BF16AC',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  boxShadow: '0 2px 4px rgba(191, 22, 172, 0.1)',
}

const contactCard = {
  backgroundColor: '#ffffff',
  border: '2px solid #BF16AC',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  boxShadow: '0 2px 4px rgba(191, 22, 172, 0.1)',
}

const cardHeading = {
  color: '#1a202c',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 16px 0',
  fontFamily: 'Titillium Web, sans-serif',
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
  fontFamily: 'Titillium Web, sans-serif',
}

const detailValue = {
  color: '#1a202c',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0',
  fontFamily: 'Titillium Web, sans-serif',
}

const companyInfo = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  fontFamily: 'Titillium Web, sans-serif',
}

const emailLink = {
  color: '#BF16AC',
  textDecoration: 'underline',
  fontFamily: 'Titillium Web, sans-serif',
}

const noteSection = {
  backgroundColor: '#fef7f0',
  border: '1px solid #BF16AC',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
}

const noteText = {
  color: '#744210',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  fontFamily: 'Titillium Web, sans-serif',
}

const closing = {
  color: '#1a202c',
  fontSize: '16px',
  fontWeight: '600',
  margin: '24px 0 16px 0',
  fontFamily: 'Titillium Web, sans-serif',
}

const signature = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0 32px 0',
  fontFamily: 'Titillium Web, sans-serif',
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
  fontFamily: 'Titillium Web, sans-serif',
}
