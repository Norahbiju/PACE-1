param(
  [string]$RoleName = "pace-profile-github-actions-role",
  [string]$GitHubRepository = "Norahbiju/PACE-1",
  [string]$AwsRegion = "us-east-1",
  [string]$DynamoDbTableName = "pace-employees"
)

$ErrorActionPreference = "Stop"

$accountId = aws sts get-caller-identity --query Account --output text
$providerArn = "arn:aws:iam::$accountId`:oidc-provider/token.actions.githubusercontent.com"
$roleArn = "arn:aws:iam::$accountId`:role/$RoleName"

$providerExists = aws iam list-open-id-connect-providers --query "OpenIDConnectProviderList[?Arn=='$providerArn'].Arn | [0]" --output text
if ($providerExists -eq "None" -or [string]::IsNullOrWhiteSpace($providerExists)) {
  aws iam create-open-id-connect-provider `
    --url "https://token.actions.githubusercontent.com" `
    --client-id-list "sts.amazonaws.com" `
    --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1" | Out-Null
}

$trustPolicy = @{
  Version = "2012-10-17"
  Statement = @(
    @{
      Effect = "Allow"
      Principal = @{
        Federated = $providerArn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = @{
        StringEquals = @{
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = @{
          "token.actions.githubusercontent.com:sub" = "repo:$GitHubRepository`:*"
        }
      }
    }
  )
} | ConvertTo-Json -Depth 10

$trustFile = New-TemporaryFile
$trustPolicy | Set-Content -LiteralPath $trustFile -Encoding ascii

$roleExists = aws iam list-roles --query "Roles[?RoleName=='$RoleName'].Arn | [0]" --output text
if ($roleExists -eq "None" -or [string]::IsNullOrWhiteSpace($roleExists)) {
  aws iam create-role --role-name $RoleName --assume-role-policy-document "file://$trustFile" | Out-Null
} else {
  aws iam update-assume-role-policy --role-name $RoleName --policy-document "file://$trustFile" | Out-Null
}

$policy = @{
  Version = "2012-10-17"
  Statement = @(
    @{
      Sid = "TerraformEc2IamDynamoDbAndSsm"
      Effect = "Allow"
      Action = @(
        "ec2:*",
        "dynamodb:*",
        "ssm:SendCommand",
        "ssm:GetCommandInvocation",
        "ssm:ListCommandInvocations",
        "ssm:ListCommands",
        "ssm:DescribeInstanceInformation",
        "iam:*"
      )
      Resource = "*"
    }
  )
} | ConvertTo-Json -Depth 10

$policyFile = New-TemporaryFile
$policy | Set-Content -LiteralPath $policyFile -Encoding ascii

aws iam put-role-policy `
  --role-name $RoleName `
  --policy-name "pace-profile-github-actions-policy" `
  --policy-document "file://$policyFile" | Out-Null

Remove-Item -LiteralPath $trustFile, $policyFile -Force

Write-Host "Created/updated GitHub OIDC role."
Write-Host "Add this to GitHub Secrets as AWS_GITHUB_OIDC_ROLE_ARN:"
Write-Host $roleArn
Write-Host ""
Write-Host "Use this GitHub variable:"
Write-Host "AWS_REGION=$AwsRegion"
Write-Host "DYNAMODB_TABLE_NAME=$DynamoDbTableName"
