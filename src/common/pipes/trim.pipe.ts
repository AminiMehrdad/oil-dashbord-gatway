import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body' && typeof value === 'object') {
      return this.trim(value);
    }
    return value;
  }

  private trim(values: any) {
    Object.keys(values).forEach((key) => {
      if (typeof values[key] === 'string') {
        values[key] = values[key].trim();
      } else if (typeof values[key] === 'object' && values[key] !== null) {
        this.trim(values[key]);
      }
    });
    return values;
  }
}