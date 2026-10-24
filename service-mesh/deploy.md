Deploy everything
Step 20: Apply the YAML file
Make sure you're in the mesh-demo directory and that the complete mesh-demo.yaml file contains all seven resources:
1. User Service Deployment.
2. User Service Kubernetes Service.
3. Payment v1 Deployment.
4. Payment v2 Deployment.
5. Payment Kubernetes Service.
6. DestinationRule.
7. VirtualService.
8. PeerAuthentication.
There are eight resources in this list.

Run:
kubectl apply -f mesh-demo.yaml

What does this command do?
- kubectl is the Kubernetes command-line tool.
- apply creates or updates the resources described in the file.
- -f mesh-demo.yaml tells Kubernetes which file to use.


#

Check the deployments
Run:
kubectl get deployments

You should eventually see these deployment names:
user-service
payment-v1
payment-v2

Wait until the desired replicas are ready.

You can check again with:
kubectl get deployments


#

kubectl get pods