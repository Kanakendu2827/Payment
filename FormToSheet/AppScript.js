function doPost(e) {
  try {
    const rawBody = typeof e?.postData?.contents === 'string' ? e.postData.contents : '';
    let data = {};

    if (rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch (error) {
        data = {};
      }
    }

    if (!data || typeof data !== 'object') {
      data = {};
    }

    const normalizeValue = (value) => (Array.isArray(value) ? value[0] : value);
    const getValue = (keys) => {
      for (const key of keys) {
        const value = normalizeValue(data[key]);
        if (value !== undefined && value !== null && value !== '') {
          return String(value);
        }
      }
      return '';
    };

    const spreadsheetId = '1jsDw41ok3CbmXBiAE5JhHQLqdRJnYMRCBU1Uor66oTQ';
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    } catch (spreadsheetError) {
      spreadsheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1jsDw41ok3CbmXBiAE5JhHQLqdRJnYMRCBU1Uor66oTQ/edit?resourcekey=&gid=1037161479#gid=1037161479');
    }

    let sheet = spreadsheet.getSheetByName('Sheet1');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Sheet1');
    }

    const headers = ['Timestamp', 'Name', 'Mobile', 'Email', 'Member ID', 'Address', 'Quantity', 'Size', 'Delivery Type', 'Amount', 'Product', 'Screenshot Name', 'Screenshot URL'];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }

    const name = getValue(['name', 'Name']);
    const mobile = getValue(['mobile', 'Contact Number', 'Contact']);
    const email = getValue(['email', 'Email']);
    const memberId = getValue(['memberId', 'memberID', 'member_id', 'Member ID']);
    const address = getValue(['address', 'Address']);
    const quantity = getValue(['quantity', 'Quantity']);
    const amount = getValue(['amount', 'total', 'Amount', 'Total']);
    const product = getValue(['product', 'Product']);
    const size = getValue(['size', 'tshirtSize', 'tshirt_size', 'Tshirt Size']);
    const deliveryType = getValue(['deliveryType', 'Delivery Type']);
    const screenshotValue = getValue(['screenshot', 'screenshotBase64', 'screenshotDataUrl', 'screenshotDataURL']);
    const screenshotType = getValue(['fileType', 'screenshotType', 'type']) || 'image/png';
    const screenshotName = getValue(['screenshotName', 'fileName', 'name']) || 'payment-screenshot.png';

    const timestamp = new Date().toISOString();
    const rowIndex = sheet.getLastRow() + 1;
    sheet.appendRow([
      timestamp,
      name,
      mobile,
      email,
      memberId,
      address,
      quantity,
      size,
      deliveryType,
      amount,
      product,
      '',
      ''
    ]);
    SpreadsheetApp.flush();

    let screenshotUrl = '';
    let imageUploadError = '';
    const cleanedScreenshotValue = String(screenshotValue || '').trim();
    const dataUrlMatch = cleanedScreenshotValue.match(/^data:(.+);base64,(.+)$/i);

    if (cleanedScreenshotValue) {
      try {
        const mimeType = dataUrlMatch ? (dataUrlMatch[1] || screenshotType) : screenshotType;
        const base64Payload = dataUrlMatch ? dataUrlMatch[2] : cleanedScreenshotValue;
        const decodedBytes = Utilities.base64Decode(base64Payload);
        const blob = Utilities.newBlob(decodedBytes, mimeType, screenshotName);

        const file = DriveApp.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        screenshotUrl = file.getUrl();

        sheet.getRange(rowIndex, 12).setValue(screenshotName);
        sheet.getRange(rowIndex, 13).setValue(screenshotUrl);
        SpreadsheetApp.flush();
      } catch (driveError) {
        imageUploadError = driveError.toString();
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Order submitted successfully',
      imageUrl: screenshotUrl,
      imageUploadError: imageUploadError || null
    }));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    }));
  }
}
  