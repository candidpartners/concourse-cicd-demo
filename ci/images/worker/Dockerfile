FROM amazonlinux:2

RUN yum install -y gcc-c++ make \
        && curl -sL https://rpm.nodesource.com/setup_12.x | bash - \
        && yum update -y \
        && yum install -y \
        wget \
        jq \
        make \
        nodejs \
        unzip \
        zip \
        && npm install -g serverless \
        && curl -O https://releases.hashicorp.com/terraform/0.12.13/terraform_0.12.13_linux_amd64.zip \
        && unzip terraform_0.12.13_linux_amd64.zip -d /usr/bin/ \
        && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
        && unzip awscliv2.zip \
        && ./aws/install \
        && rm awscliv2.zip terraform_0.12.13_linux_amd64.zip \
        && yum clean all \
        && rm -rf /var/cache/yum
