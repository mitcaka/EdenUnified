import { z } from 'zod'

export const LoginSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tài khoản'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

export const UserSchema = z.object({
  username: z.string().min(3, 'Tài khoản tối thiểu 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  name: z.string().min(1, 'Vui lòng nhập họ tên'),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']),
  isActive: z.boolean().default(true),
  discordUserId: z.string().regex(/^\d*$/, 'Chỉ nhập số').max(25, 'Tối đa 25 ký tự').optional().or(z.literal('')),
})

export const UpdateUserSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập họ tên'),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  discordUserId: z.string().regex(/^\d*$/, 'Chỉ nhập số').max(25, 'Tối đa 25 ký tự').optional().or(z.literal('')),
})

export const ProjectSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên dự án'),
  description: z.string().optional(),
})

export const TaskSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tên công việc'),
  description: z.string().optional(),
  status: z.enum(['BACKLOG', 'TODO', 'DOING', 'NEED_REVIEW', 'NEED_TEST', 'DONE', 'CANCELLED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  category: z.string().optional(),
  evidenceUrl: z.string().optional().or(z.literal('')),
  projectId: z.string().min(1, 'Vui lòng chọn dự án'),
  assigneeId: z.string().optional().or(z.literal('')),
  reviewerId: z.string().optional().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
  pointEstimate: z.number().min(0).default(0),
  pointActual: z.number().min(0).default(0),
  bonusPoint: z.number().min(0).default(0),
  penaltyPoint: z.number().min(0).default(0),
  pointReason: z.string().optional(),
})
