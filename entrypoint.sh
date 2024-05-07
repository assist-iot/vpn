#!bin/bash

sysctl net.ipv4.ip_forward=1
sysctl net.ipv4.conf.all.src_valid_mark=1

# create Wireguard network interface
ip link add dev wg0 type wireguard
ip address add dev wg0 $WG_SUBNET
echo $WG_PRIVATE_KEY > privatekey
wg set wg0 listen-port $WG_PORT private-key privatekey
rm privatekey
ip link set up dev wg0

# Wireguard iptables
iptables -A FORWARD -i wg0 -j ACCEPT
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

# run API
npm run server