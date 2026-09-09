import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { StudentStatus } from '@ghss/database';

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;

  @IsUUID()
  @IsOptional()
  admissionAcademicYearId?: string;
}
