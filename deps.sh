#!/bin/bash

set -o errexit

apt-get -q update
apt-get install -y libdbus-1-dev libdbus-glib-1-dev libglib2.0-dev libical-dev libreadline-dev libudev-dev libusb-dev make

cd
mkdir -p libs/bluez
cd libs/bluez
wget https://www.kernel.org/pub/linux/bluetooth/bluez-5.32.tar.xzwget https://www.kernel.org/pub/linux/bluetooth/bluez-5.32.tar.xz
tar xvf bluez-5.32.tar.xz
cd bluez-5.32

./configure --disable-systemd
make
sudo make install

sudo hciconfig hci0 up
