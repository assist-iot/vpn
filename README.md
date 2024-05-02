# VPN Enabler
Assist-IoT VPN Enabler. Developed using Node.js v14.18.1 and Wireguard v1.0.20200827.

**IMPORTANT**: in K8s, don't run more than one replica of the VPN Enabler container.

## Local development

1. Install Wireguard in the machine: https://www.wireguard.com/install/ 

2. Create a Wireguard interface for testing. Configuration example can be found at: *examples/wg0.conf*.
    ```bash
    sudo wg-quick up <path_to_wg_config_file>
    ```

3. Add *sudo* before all the *wg* commands to run the API without being containerized, e.g.:

        utils/index.js, line 35:    await exec(`wg ... -> await exec(`sudo wg ... )

4. Execute:
    ```bash
    npm install
    ```

5. Execute:
    ```bash
    npm run server
    ```

## Configuration

The configurable parameters can be found at *config/index.js*.

For running the containerized app, it can be configured using the following environment variables:

* **WG_PRIVATE_KEY**: private key for the Wireguard server. To generate it, see the [Generate wg server private key](#generate-a-wireguard-server-private-key) section.
* **API_PORT**: TCP port where it is exposed the API.
* **SERVER_IP**: public IP of the machine where runs the VPN enabler.
* **WG_SUBNET**: internal subnet of the Wireguard interface. The value must be the first IP of the subnet in CIDR format (<subnet_first_ip>/<subnet_mask_bits>, e.g., for the subnet 192.168.2.0/24, the value must be 192.168.2.1/24). This parameter is important because determines the maximum number of clients of the VPN. For the example subnet, the maximum number of clients will be 253.
* **WG_PORT**: UDP port where it is exposed the Wireguard network interface.
* **PEER_ALLOWED_IPS**: allowed subnets for the clients. A value of *0.0.0.0/0,::/0* will allow the clients to connect to every network via the VPN, including to the internet. Specifying a subnetwork (e.g. 10.1.243.0/24) the client will only be able to reach this subnetwork.
* **MONGODB_HOST**: host of the MongoDB database.
* **MONGODB_PORT**: port number of the MongoDB database.
* **MONGODB_USER**: user of the MongoDB database.
* **MONGODB_PASS**: password for the selected user of the MongoDB database.

## Docker images
The public Docker images registry is located at https://hub.docker.com/r/assistiot/vpn

## Run in Docker

A *docker-compose* example is included.

## Run in Kubernetes

Examples can be found in the *k8s* folder:
```bash
kubectl deploy -f k8s/mongo-statefulset.yaml

kubectl deploy -f k8s/deployment.yaml
```

Network policies are also included:
```bash
kubectl deploy -f k8s/wg-api-network-policy.yaml

kubectl deploy -f k8s/wg-mongo-network-policy.yaml
```
### Helm chart

A Helm chart (https://helm.sh/) is included in the *k8s/helm-chart* folder:
```bash
helm install vpn-enabler k8s/helm-chart
```

## Generate a Wireguard server private key

Using the Wireguard cli:
```bash
wg genkey
```

## Create the Wireguard client configuration file

1. Generate the client keys: public, private and pre-shared.
    ```bash
        curl --location --request GET 'http://<wg_api_IP_address>:<wg_api_port>/keys'
    ```

    Response example:
    ```json
        {
            "public": "RfGgIjkPJC9U6b0OE8UHdnJwAA4hCV1FfQOX1/FaIzo=",
            "private": "YDhkBXyym+L255TwBGHWXXWcaMqaGqlJLLyc4XyyE18=",
            "preshared": "FIOSD2ErZISlHwFsBRK5RVyd7ENhvJ4x3W101BoewqQ="
        }
    ```

2. Create a client in the API.
    ```bash
        curl --location --request POST '<wg_api_IP_address>:<wg_api_port>/client' \
        --header 'Content-Type: application/json' \
        --data-raw '{
            "publicKey": <client_public_key>,
            "presharedKey": <client_preshared_key>
        }'
    ```

    Request example:
    ```bash
        curl --location --request POST 'http://192.168.1.67:30000/client' \
        --header 'Content-Type: application/json' \
        --data-raw '{
            "publicKey": "RfGgIjkPJC9U6b0OE8UHdnJwAA4hCV1FfQOX1/FaIzo=",
            "presharedKey": "FIOSD2ErZISlHwFsBRK5RVyd7ENhvJ4x3W101BoewqQ="
        }'
    ```

    Response example:
    ```json
        {
            "serverPublicKey": "iJT+CW4QoWNDIDo763CPx1TZ3x9bSNTN5t0uQbzo5jo=",
            "serverIP": "192.168.1.67",
            "serverPort": "51820",
            "clientIP": "192.168.2.56/32",
            "allowedIPs": "0.0.0.0/0,::/0",
            "message": "Peer added successfully"
        }
    ```

3. Create the Wireguard client configuration file with the data obtained in the responses of the last two requests. A template can be found at *examples/client-template.conf* and,furtheremore, a complete example filled with the responses of the last two requests examples can be found at *examples/client.conf*.

4. Connect to the VPN using a client program.

## Connect to the VPN

In Windows, use the TunSafe VPN client (https://tunsafe.com/):

1. Create the Wireguard configuration file
2. Import the configuration file
3. Connect to the VPN

In Linux, use the Wireguard cli.

1. Install Wireguard
2. Create the Wireguard configuration file
3. Create the Wireguard interface and connect to the VPN:
    ```bash
    sudo wg-quick up <path_to_wg_config_file>
    ```

4. To disconnect:
    ```bash
    sudo wg-quick down <path_to_wg_config_file>
    ```