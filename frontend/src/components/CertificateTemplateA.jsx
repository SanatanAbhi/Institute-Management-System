import logo from "../assets/logo/ACHARYA_SKILLS_MISISON_LOGO.png";

export default function CertificateTemplateA({ certificate }) {
  return (
    <div id="certificate-a" className="certificate-template-a">
      <div className="certificate-inner-border">

        {/* ================= HEADER ================= */}

        <div className="certificate-header">

          <div className="header-logo-left">
            <img
              src={logo}
              alt="Acharya Skill Mission"
              className="certificate-logo"
            />
          </div>

          <div className="header-center">

            <small className="certificate-small-heading">
              AN AUTONOMOUS EDUCATIONAL MISSION
            </small>

            <h2 className="certificate-brand-top">
              ACHARYA
            </h2>

            <h1 className="certificate-brand-main">
              SKILL MISSION
            </h1>

            <p className="certificate-sub-heading">
              Skill Development • Computer Education • Vocational Training
            </p>

            <small className="certificate-iso-text">
              ISO 9001 : 2015 CERTIFIED ORGANIZATION
            </small>

          </div>

          <div className="header-logo-right">
            <div className="iso-badge">
              <small>ISO</small>
              <h5>9001</h5>
              <small>2015</small>
            </div>
          </div>

        </div>

        <div className="certificate-divider"></div>

        {/* Certificate Number */}

        <div className="certificate-number-top">
          Certificate No : {certificate.certificate_id}
        </div>

        {/* ================= TITLE ================= */}

        <div className="certificate-title-box">

          <h1 className="certificate-main-title">
            CERTIFICATE
          </h1>

          <p className="certificate-course-title">
            TYPING SPEED & ACCURACY
          </p>

        </div>

        {/* ================= BODY ================= */}

        <div className="certificate-body-section">

          <p>This Certificate is proudly presented to</p>

          <h2 className="certificate-student-name">
            {certificate.student_name}
          </h2>

          <div className="student-name-line"></div>

          <p>Son / Daughter of</p>

          <h4 className="certificate-father-name">
            {certificate.father_name || "Rajesh Kumar"}
          </h4>

          <p>Registration Number</p>

          <h5 className="certificate-registration">
            {certificate.registration_number || "PTN-14/2026/0001"}
          </h5>

          <p>has successfully completed the course</p>

          <h3 className="certificate-course-name">
            {certificate.course_name}
          </h3>

          <p className="certificate-performance">
            with excellent performance, dedication and commitment during the training programme.
          </p>

        </div>

        {/* ================= DETAILS TABLE ================= */}

        <div className="certificate-details-table">

          <table className="certificate-table">

            <thead>

              <tr>
                <th>Duration</th>
                <th>Grade</th>
                <th>Issue Date</th>
                <th>Study Center</th>
              </tr>

            </thead>

            <tbody>

              <tr>
                <td>{certificate.duration || "6 Months"}</td>
                <td className="grade-cell">
                  {certificate.grade || "A+"}
                </td>
                <td>{certificate.completion_date}</td>
                <td>{certificate.center_name || "Ameerpet, Hyderabad"}</td>
              </tr>

            </tbody>

          </table>

        </div>

        {/* ================= FOOTER ================= */}

        <div className="certificate-footer-section">

          <div className="signature-box">
            <div className="signature-line"></div>
            <p>Center Director</p>
          </div>

          <div className="certificate-qr-box">
            <i className="bi bi-qr-code"></i>
            <small>Scan To Verify</small>
          </div>

          <div className="signature-box">
            <div className="signature-line"></div>
            <p>Managing Director</p>
          </div>

        </div>

        {/* Bottom Strip */}

        <div className="certificate-bottom-strip">

          <span>www.acharyaskillmission.org</span>

          <span>Authorized Training Centre</span>

          <span>Skill • Knowledge • Success</span>

        </div>

      </div>
    </div>
  );
}