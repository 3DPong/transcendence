import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';

export const CreateFileValidationPipe = (maxSizeKB, fileType) => {
  return new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: maxSizeKB * 1000 }),
      new FileTypeValidator({ fileType: fileType }),
    ],
  });
};
