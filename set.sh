#!/bin/bash

set -e

function install_packages {
    if [ -f /etc/debian_version ]; then
        PKG_MANAGER="apt-get"
        UPDATE_CMD="sudo apt-get update"
        INSTALL_CMD="sudo apt-get install -y"
    elif [ -f /etc/redhat-release ]; then
        if command -v dnf &> /dev/null; then
            PKG_MANAGER="dnf"
            UPDATE_CMD="sudo dnf check-update"
            INSTALL_CMD="sudo dnf install -y"
        else
            PKG_MANAGER="yum"
            UPDATE_CMD="sudo yum check-update"
            INSTALL_CMD="sudo yum install -y"
        fi
    else
        echo "Unsupported OS."
        exit 1
    fi

    REQUIRED_PACKAGES="git curl ffmpeg"
    for pkg in $REQUIRED_PACKAGES; do
        if ! command -v $pkg &> /dev/null; then
            $UPDATE_CMD
            $INSTALL_CMD $pkg
        fi
    done
}

function install_nvm_node {
    if ! command -v nvm &> /dev/null; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    nvm install node
    nvm use node
}

function install_pm2 {
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi
}

clear
echo " ____                             _                      _    "
echo "|  _ \ ___  __ _ _ __  _ __   ___| |___      _____  _ __| | __"
echo "| |_) / __|/ _\` | '_ \| '_ \ / _ \ __\ \ /\ / / _ \| '__| |/ /"
echo "|  __/\__ \ (_| | | | | | | |  __/ |_ \ V  V / (_) | |  |   < "
echo "|_|   |___/\__,_|_| |_|_| |_|\___|\__| \_/\_/ \___/|_|  |_|\_\\"


echo "1) Start the application"
echo "2) Stop and delete the application"
echo "3) Check application status"
echo "4) View application logs"
read -p "Enter your choice: " CHOICE

if [ "$CHOICE" == "1" ]; then
    install_packages
    install_nvm_node
    install_pm2

    # youtube-searcherディレクトリが存在するか確認
    if [ -d "youtube-searcher" ]; then
        echo "Existing youtube-searcher directory found. Deleting..."
        sudo rm -rf youtube-searcher
    fi
    
    git clone https://github.com/hirotomoki12345/youtube-searcher.git
    cd youtube-searcher
    npm install
    sudo pm2 start npm --name "youtube-searcher-app" -- start 
    cd -
    sudo pm2 save
    sudo pm2 startup
elif [ "$CHOICE" == "2" ]; then
    sudo pm2 stop "youtube-searcher-app"
    sudo pm2 delete "youtube-searcher-app"
    sudo rm -rf youtube-searcher
elif [ "$CHOICE" == "3" ]; then
    pm2 status "youtube-searcher-app"
elif [ "$CHOICE" == "4" ]; then
    pm2 logs "youtube-searcher-app"
else
    echo "Invalid choice."
fi
