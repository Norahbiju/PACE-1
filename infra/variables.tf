variable "project_name" {
  type    = string
  default = "pace-profile"
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "dynamodb_table_name" {
  type    = string
  default = "pace-employees"
}

variable "ec2_instance_type" {
  type    = string
  default = "t3.micro"
}

variable "app_port" {
  type    = number
  default = 3000
}

variable "repo_url" {
  type    = string
  default = "https://github.com/Norahbiju/PACE-1.git"
}

variable "ec2_ami_id" {
  type    = string
  default = ""
}
