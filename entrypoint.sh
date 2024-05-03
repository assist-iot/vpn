#!bin/bash

# network prerequirements
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
if [[$PEER_ALLOWED_IPS == *"0.0.0.0/0"*]];
then
  iptables -A FORWARD -i wg0 -j ACCEPT
  iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
else
  iptables -t mangle -A PREROUTING -i wg0 -j MARK --set-mark 0x30
  iptables -t nat -A POSTROUTING ! -o wg0 -m mark --mark 0x30 -j MASQUERADE
  iptables -I FORWARD -i wg0 -j REJECT
  iptables -I FORWARD -i wg0 -d $PEER_ALLOWED_IPS -j ACCEPT
fi

if [[$PEER_ALLOWED_IPS == *"::/0"*]];
then
  ip6tables -A FORWARD -i wg0 -j ACCEPT
  ip6tables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
fi

# run API
npm run server