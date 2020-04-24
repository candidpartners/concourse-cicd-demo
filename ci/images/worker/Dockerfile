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
    awscli \
    && npm install -g serverless \
    && curl -O https://releases.hashicorp.com/terraform/0.12.13/terraform_0.12.13_linux_amd64.zip \
    && unzip terraform_0.12.13_linux_amd64.zip -d /usr/bin/ \
    && yum clean all
