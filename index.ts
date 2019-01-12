import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const infraStackName = config.require("infraStackName");
const appName = "blog";

const appLabels = {
    app: appName
};

const kubeconfig = new pulumi.StackReference("infraStackName", { name: infraStackName })
    .getOutput("kubeconfig");

const provider = new k8s.Provider("provider", {
    kubeconfig: kubeconfig.apply(config => JSON.stringify(config)),
});

const deployment = new k8s.apps.v1.Deployment(
    "blog",
    {
        spec: {
            selector: {
                matchLabels: appLabels
            },
            replicas: 1,
            template: {
                metadata: {
                    labels: appLabels,
                },
                spec: {
                    containers: [
                        {
                            name: "ghost",
                            image: "ghost",
                        }
                    ],
                },
            },
        },
    },
    {
        provider: provider,
    }
);

const blog = new k8s.core.v1.Service(
    appName,
    {
        metadata: {
            labels: deployment.spec.apply(spec => spec.template.metadata.labels),
        },
        spec: {
            type: "LoadBalancer",
            ports: [
                {
                    port: 80,
                    targetPort: 2368,
                    protocol: "TCP",
                },
            ],
            selector: appLabels,
        },
    },
    {
        provider: provider,
    }
);

export const name = deployment.metadata.apply(m => m.name);
export const ingress = blog.status.apply(status => status.loadBalancer.ingress[0]);
