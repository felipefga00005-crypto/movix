import { PartialType } from '@nestjs/mapped-types';
import { CreateEmitenteDto } from './create-emitente.dto';

export class UpdateEmitenteDto extends PartialType(CreateEmitenteDto) {}
