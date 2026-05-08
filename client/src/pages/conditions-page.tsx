import { PageLayout } from "@/components/layout/page-layout";

export default function ConditionsPage() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">Terms and Conditions</h1>
          <p className="text-muted-foreground mt-2">Last updated: July 1, 2023</p>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <p>
            These terms and conditions ("Conditions") outline the rules and regulations for using KindLeah Investment's tutoring platform and services.
          </p>
          
          <h2>1. Service-Specific Conditions</h2>
          <p>
            The following conditions apply specifically to our academic tutoring services:
          </p>
          
          <h3>1.1 Tutoring Sessions</h3>
          <p>
            All tutoring sessions must be scheduled through our platform. Sessions booked directly with tutors outside our platform are not covered by these Conditions and we cannot guarantee their quality or provide support for such sessions.
          </p>
          <ul>
            <li>Sessions are scheduled in blocks of 30 minutes, with a minimum session length of 1 hour.</li>
            <li>Sessions begin and end at the scheduled times. Tutors are not obligated to extend sessions beyond their scheduled end time.</li>
            <li>If you are late for a session, the session will still end at the scheduled time and you will be charged for the full scheduled duration.</li>
          </ul>
          
          <h3>1.2 Cancellation and Rescheduling</h3>
          <p>
            Our cancellation and rescheduling policy is as follows:
          </p>
          <ul>
            <li>Sessions can be cancelled or rescheduled without penalty up to 24 hours before the scheduled start time.</li>
            <li>Cancellations or rescheduling requests made less than 24 hours before the scheduled start time may be subject to a fee of 50% of the session cost.</li>
            <li>Failure to attend a scheduled session without prior notice ("no-show") will result in a charge for the full session cost.</li>
            <li>Tutors may cancel or reschedule sessions with at least 24 hours' notice. If a tutor cancels with less notice, you will be offered a rescheduled session at no additional cost or a full refund.</li>
          </ul>
          
          <h3>1.3 Payment and Refunds</h3>
          <p>
            Our payment and refund policy includes:
          </p>
          <ul>
            <li>Payment for tutoring sessions must be made in advance through our secure payment system.</li>
            <li>We accept major credit cards, debit cards, and select mobile payment methods.</li>
            <li>Refunds are provided for sessions cancelled in accordance with our cancellation policy.</li>
            <li>If you are dissatisfied with a tutoring session, you may request a refund within 48 hours of the session's completion. Refund requests will be evaluated on a case-by-case basis.</li>
            <li>Subscription plans are billed on a recurring basis until cancelled. Cancellations take effect at the end of the current billing period.</li>
          </ul>
          
          <h3>1.4 Session Recording</h3>
          <p>
            For quality assurance and educational purposes:
          </p>
          <ul>
            <li>Tutoring sessions may be recorded with the consent of all participants.</li>
            <li>Recorded sessions are accessible only to the student, tutor, and authorized KindLeah Investment staff.</li>
            <li>Recordings may be used for quality review, training purposes, or to resolve disputes.</li>
            <li>Downloading, sharing, or distributing session recordings without explicit permission is strictly prohibited.</li>
          </ul>
          
          <h2>2. Academic Integrity</h2>
          <p>
            We are committed to upholding academic integrity:
          </p>
          <ul>
            <li>Our tutoring services are designed to help you understand concepts, develop skills, and improve your academic performance.</li>
            <li>We do not provide services intended to enable academic dishonesty, including but not limited to completing assignments on your behalf or providing work that can be submitted as your own.</li>
            <li>Tutors may refuse to provide assistance if they believe a request violates academic integrity principles or institutional policies.</li>
            <li>You are responsible for ensuring that your use of our services complies with the academic integrity policies of your educational institution.</li>
          </ul>
          
          <h2>3. Document Sharing and Intellectual Property</h2>
          <p>
            Regarding documents shared on our platform:
          </p>
          <ul>
            <li>You may share documents with tutors through our secure document sharing system for educational purposes only.</li>
            <li>You retain ownership of any documents you upload, but grant us a license to store and display them for the purpose of providing our services.</li>
            <li>Documents containing sensitive personal information or confidential data should not be uploaded to our platform.</li>
            <li>Sharing copyrighted materials without permission is prohibited.</li>
            <li>Tutors may provide supplementary materials for educational purposes. These materials remain the intellectual property of the tutor or KindLeah Investment and should not be redistributed.</li>
          </ul>
          
          <h2>4. Communication and Conduct</h2>
          <p>
            When using our platform:
          </p>
          <ul>
            <li>All communications between students and tutors must occur through our platform.</li>
            <li>You agree to engage in respectful and professional communication at all times.</li>
            <li>Harassment, abuse, or inappropriate behavior toward tutors or other users is strictly prohibited and may result in immediate termination of your account.</li>
            <li>Sharing personal contact information for the purpose of circumventing our platform is prohibited.</li>
          </ul>
          
          <h2>5. Technical Requirements</h2>
          <p>
            To use our platform effectively:
          </p>
          <ul>
            <li>You need a stable internet connection with minimum speeds of 1.5 Mbps upload and download.</li>
            <li>Supported browsers include the latest versions of Chrome, Firefox, Safari, and Edge.</li>
            <li>For video sessions, you need a functioning webcam and microphone.</li>
            <li>Some features may require additional software or plugins, which will be specified when relevant.</li>
            <li>Technical issues on your end, including internet connectivity problems, device failures, or software compatibility issues, are your responsibility and do not qualify for refunds.</li>
          </ul>
          
          <h2>6. Account Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts:
          </p>
          <ul>
            <li>For violation of these Conditions, our Terms of Service, or our Privacy Policy.</li>
            <li>For engaging in fraudulent activities or misuse of our platform.</li>
            <li>For consistent no-shows or late cancellations.</li>
            <li>For failure to pay for services or disputes with payment providers.</li>
            <li>For any other reason at our sole discretion.</li>
          </ul>
          
          <h2>7. Changes to Conditions</h2>
          <p>
            We may update these Conditions from time to time. We will notify users of any significant changes via email or through notices on our platform. Continued use of our services after such changes constitutes acceptance of the updated Conditions.
          </p>
          
          <h2>8. Contact Information</h2>
          <p>
            For questions or concerns regarding these Conditions, please contact us at:
          </p>
          <p>
            KindLeah Investment and Projects Pty Ltd<br />
            Email: support@kindleahinvestment.com<br />
            Phone: 0734801665
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
