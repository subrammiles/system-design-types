


#
Start Kubernetes using Minikube
Open your Ubuntu terminal.

Run:
minikube start

Minikube starts a local Kubernetes cluster on your computer.

#
Your Ubuntu Computer
        |
        v
  Minikube Cluster
        |
        ├── Kubernetes control plane
        |
        ├── User Service pods
        |
        ├── Payment v1 pods
        |
        └── Payment v2 pod

At this point, the application pods do not exist yet. We are just starting the cluster.

#
#
Install Istio
Normally, Kubernetes can run your microservices and provide service discovery. But it doesn't automatically provide all the service mesh features we're going to demonstrate.

We'll install Istio to add those features.

Download Istio
Run:
curl -L https://istio.io/downloadIstio | sh -

This downloads Istio using its official installation script and extracts the distribution into a versioned directory.

Enter the extracted directory
Run:
cd istio-1.*

This works when the directory name matches that pattern and there is only one matching directory in the current location.


#

Install Istio
Run:
istioctl install --set profile=demo -y

What does each part mean?
Part	Meaning
istioctl	Istio command-line tool
install	Install Istio into Kubernetes
--set profile=demo	Select the demo configuration
-y	Automatically confirm the installation


Istio installs its control-plane components into your Kubernetes cluster.

The main control-plane component is istiod

#

Enable automatic Envoy proxy injection
Run:
kubectl label namespace default istio-injection=enabled --overwrite

This command is important.

First, understand the word namespace.

A Kubernetes namespace is a logical way to organize and isolate resources within a cluster.

Our example will use the default namespace.

The label:
istio-injection=enabled

tells Istio to automatically inject a sidecar proxy into newly created pods in that namespace, assuming the relevant Istio components and admission configuration are working correctly.

For example, without an injected sidecar:
User Pod
  └── Node.js container

With an injected sidecar:
User Pod
  ├── Node.js container
  └── Envoy proxy container

This is how Istio introduces the proxy without requiring you to write proxy-handling code in your Node.js application.

#

Verify the installation
Run:
kubectl get pods -n istio-system

The -n istio-system option means to show pods in the istio-system namespace.

Wait until the relevant Istio control-plane pods are ready.

You can also check:
kubectl get nodes

Checkpoint: Minikube is running, Istio is installed, and the default namespace is configured for automatic sidecar injection.