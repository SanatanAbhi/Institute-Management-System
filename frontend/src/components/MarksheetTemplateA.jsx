import logo from "../assets/logo/ACHARYA_SKILLS_MISISON_LOGO.png";

export default function MarksheetTemplateA({ marksheet }) {

    const subjects = marksheet.subjects || [];

    const totalObtained = subjects.reduce(
        (sum, subject) => sum + subject.marks,
        0
    );

    const totalMaximum = subjects.length * 100;

    const percentage = ((totalObtained / totalMaximum) * 100).toFixed(2);

    const grade =
        percentage >= 90
            ? "A+"
            : percentage >= 80
            ? "A"
            : percentage >= 70
            ? "B+"
            : percentage >= 60
            ? "B"
            : percentage >= 50
            ? "C"
            : "F";

    const result = percentage >= 40 ? "PASS" : "FAIL";

    return (

        <div id="marksheet-a" className="certificate-template-a">

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

                {/* ================= TITLE ================= */}

                <div className="certificate-title-box">

                    <h1 className="certificate-main-title">
                        MARKSHEET
                    </h1>

                    <p className="certificate-course-title">
                        FINAL COURSE ASSESSMENT REPORT
                    </p>

                </div>

                {/* ================= STUDENT DETAILS ================= */}

                <table className="certificate-table mb-3">

                    <tbody>

                        <tr>
                            <td><strong>Name</strong></td>
                            <td>{marksheet.student_name}</td>

                            <td><strong>Registration No.</strong></td>
                            <td>{marksheet.registration_number}</td>
                        </tr>

                        <tr>
                            <td><strong>Father's Name</strong></td>
                            <td>{marksheet.father_name}</td>

                            <td><strong>Course</strong></td>
                            <td>{marksheet.course_name}</td>
                        </tr>

                        <tr>
                            <td><strong>Duration</strong></td>
                            <td>{marksheet.duration}</td>

                            <td><strong>Exam Date</strong></td>
                            <td>{marksheet.completion_date}</td>
                        </tr>

                        <tr>
                            <td><strong>Study Center</strong></td>
                            <td colSpan={3}>
                                {marksheet.center_name}
                            </td>
                        </tr>

                    </tbody>

                </table>

                {/* ================= SUBJECT TABLE ================= */}

                <table className="certificate-table">

                    <thead>

                        <tr>

                            <th width="10%">#</th>

                            <th width="46%">Subject</th>

                            <th width="22%">Maximum</th>

                            <th width="22%">Obtained</th>

                        </tr>

                    </thead>

                    <tbody>

                        {subjects.map((subject, index) => (

                            <tr key={subject.id}>

                                <td>{index + 1}</td>

                                <td>{subject.subject}</td>

                                <td>100</td>

                                <td className="grade-cell">
                                    {subject.marks}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

                {/* ================= RESULT SUMMARY ================= */}

                <div className="certificate-details-table mt-3">

                    <table className="certificate-table">

                        <tbody>

                            <tr>

                                <td><strong>Total Marks</strong></td>

                                <td>{totalObtained}/{totalMaximum}</td>

                                <td><strong>Percentage</strong></td>

                                <td>{percentage}%</td>

                            </tr>

                            <tr>

                                <td><strong>Grade</strong></td>

                                <td className="grade-cell">
                                    {grade}
                                </td>

                                <td><strong>Result</strong></td>

                                <td className="grade-cell">
                                    {result}
                                </td>

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

                {/* ================= BOTTOM STRIP ================= */}

                <div className="certificate-bottom-strip">

                    <span>www.acharyaskillmission.org</span>

                    <span>Authorized Training Centre</span>

                    <span>Skill • Knowledge • Success</span>

                </div>

            </div>

        </div>

    );
}