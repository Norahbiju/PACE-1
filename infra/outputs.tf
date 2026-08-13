output "public_ip" {
  value = aws_instance.app.public_ip
}

output "public_url" {
  value = "http://${aws_instance.app.public_ip}"
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.employees.name
}

output "ec2_instance_id" {
  value = aws_instance.app.id
}
