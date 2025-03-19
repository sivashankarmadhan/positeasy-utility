const handleGeneratePDFReport = (props) => {
  const { heading, paymentRows, startDate, endDate, title, docTitle, columns, logo } = props;
  return `

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Document Title</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }

        #header {
            text-align: center;
            margin-bottom: 20px;
        }

        #logo {
            max-width: 100px;
            max-height: 100px;
        }

        #report-info {
            margin-bottom: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        th, td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
        }

        th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
    <div id="header">
        <img id="logo" src=${logo} alt="POSITEASY">
        <h1>Your Document Title</h1>
    </div>

    <div id="report-info">
        <p><strong>Start Date:</strong> ${startDate}</p>
        <p><strong>End Date:</strong> ${endDate}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Dynamic Header 1</th>
                <th>Dynamic Header 2</th>
                <!-- Add more headers as needed -->
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Value 1</td>
                <td>Value 2</td>
                <!-- Add more values as needed -->
            </tr>
            <!-- Add more rows as needed -->
        </tbody>
    </table>

    <!-- Additional content goes here -->

</body>
`;
};

export default handleGeneratePDFReport;
