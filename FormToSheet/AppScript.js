function doPost(e) {
  try {
    const data = typeof e.postData?.contents === 'string'
      ? JSON.parse(e.postData.contents)
      : e.parameter || {};

    const sheetUrl = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1V4KRS8J5CGostWXRA1jJB82rMQb1BiyoaxKuXpK8Spw/edit?gid=0#gid=0");
    const sheet = sheetUrl.getSheetByName('Sheet1');

    let screenshotUrl = '';
    if (data.screenshotBase64) {
      const blob = Utilities.newBlob(
        Utilities.base64Decode(data.screenshotBase64),
        data.screenshotType || 'image/png',
        data.screenshotName || 'payment-screenshot.png'
      );

      const file = DriveApp.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      screenshotUrl = file.getUrl();
    }

    sheet.appendRow([
      data.name || '',
      data.mobile || '',
      data.email || '',
      data.address || '',
      data.quantity || '',
      data.total || '',
      data.screenshotName || '',
      screenshotUrl
    ]);

    return ContentService.createTextOutput(JSON.stringify({ success: true, imageUrl: screenshotUrl }));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }));
  }
}
  