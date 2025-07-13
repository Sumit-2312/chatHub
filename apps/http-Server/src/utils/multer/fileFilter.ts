import path from 'path';

const fileFilter = (req: any, file: any, callback: any) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.xls', '.xlsx', '.doc', '.docx'];
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
  ];

  if (allowedExtensions.includes(extension) && allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true); 
  } else {
    callback(new Error('Only image (jpg/png), PDF, Word, and Excel files are allowed'), false);
  }
};

export default fileFilter;
