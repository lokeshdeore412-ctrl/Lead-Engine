
# Lead Engine

**Lead Engine** is a configurable lead-processing system built with **n8n, PostgreSQL, and a lightweight website-tracking SDK**.

It captures website activity, identifies and classifies leads, applies deterministic scoring, enriches qualified leads, generates AI-assisted sales context, stores lead data, and sends notifications through Slack.
The core workflow remains consistent while each deployment is configured for the client's website and business requirements.

---

## What It Does

```text
Website
   ↓
Tracking SDK
   ↓
n8n Webhook
   ↓
Lead Processing
   ↓
Classification + Scoring
   ↓
Enrichment
   ↓
PostgreSQL
   ↓
Slack Notification
````

### Core capabilities

* Website signal capture
* New and returning lead identification
* Personal and enterprise classification
* Deterministic lead scoring
* Returning-lead frequency and heat scoring
* Keyword-based qualification and rescue logic
* Configurable enrichment
* AI-assisted sales context
* Slack notifications
* PostgreSQL storage
* Event idempotency
* System error handling

## Lead Scoring

Lead Engine uses deterministic rules for lead qualification rather than relying entirely on AI.

Scoring may use:
* Website intent
* Company revenue
* Employee count
* Funding stage
* Company characteristics
* Keywords
* Interaction frequency
* Intent progression
* Touchpoints

New leads can be assigned to configurable tiers:
* Tier 1
* Tier 2
* Tier 3

Returning leads can be classified using configurable heat levels:
* Cold
* Warm
* Hot
* Hottest

Weights, thresholds, velocity rules, and qualification conditions can be adapted to the client's business.

## Enrichment

New leads can be enriched through a configurable HTTP-based provider.
Depending on the deployment, enrichment may include:

* Company name
* Employee count
* Revenue
* Industry
* Funding stage
* Country
* Company description
* Company keywords

The system can be connected to a compatible enrichment provider through an API endpoint and field mapping.
A metadata-based fallback may also be used where configured.

## AI Sales Context

Qualified leads can receive an AI-generated sales brief containing:
* Lead interest
* Company context
* Sales talking points
* Follow-up context

AI is an assistive layer. Lead scoring and qualification remain separate deterministic processes.

## Slack Notifications

Important events can be sent to Slack.
Notifications may include:

* Company and contact details
* Email
* Intent
* Score and tier
* Qualification information
* Touchpoints
* Heat score and classification
* Intent upgrades
* AI sales context
* Lead ID
* Workflow errors and failed-node details

## Configuration

Lead Engine is designed as a configurable workflow.
Typical configuration includes:

* Client ID
* Lead identity selectors
* Website signals and CSS selectors
* Scoring weights and thresholds
* Tier and heat thresholds
* Intent priority
* Velocity rules
* Keyword groups
* Rescue conditions
* Enrichment fields and provider
* AI provider
* Slack notification format

Example:

JavaScript

```
window.LeadEngineConfig = {
  clientId: "CLIENT_ID",
  webhook_url: "N8N_WEBHOOK_URL",
  storageKey: "lead_identity_v1",

  identity: {
    emailSelector: "input[type='email']"
  },

  signals: {
    demo_request: [],
    pricing_interest: [],
    sales_contact: [],
    product_exploration: [],
    resource_interest: []
  }
};
```

The selectors shown above are examples. Actual selectors depend on the target website.

## Data Storage

Lead Engine uses PostgreSQL for persistent storage.

The V1 database structure includes:
* `lead_registry` — lead identity and classification
* `active_leads` — active processed lead information
* `archived_leads` — archived records
* `failed_lead_registry` — failed processing records
* `event_idempotency` — duplicate prevention and interaction tracking

## Package Contents

```
LEAD ENGINE

├── website-tracking-sdk.js
├── lead-engine-v1-workflow.json
├── system-error-workflow.json
├── schema.sql
├── client-config.json
└── README.md
```

* `website-tracking-sdk.js` — captures configured website signals and sends events to the Lead Engine webhook.
* `lead-engine-v1-workflow.json` — main n8n lead-processing workflow.
* `system-error-workflow.json` — handles workflow execution errors.
* `schema.sql` — PostgreSQL schema.
* `client-config.json` — client-specific configuration.
* `README.md` — package and deployment documentation.

## Requirements

The current V1 package was developed and tested with:

|

Component

|

Version

|

| --- | --- |

|

Node.js

|

`v22.22.0`

|

|

n8n

|

`2.32.7`

|

|

PostgreSQL

|

`17.10`

|

External services such as enrichment providers, AI providers, and Slack require valid credentials where used.

# Deployment Options

Choose the delivery model that fits your business.

## 1. Workflow Package — No Deployment

For clients who already have an n8n environment or technical support.

You receive:
* The Lead Engine package
* Workflow configured for your business
* Website signals and scoring configuration
* Client-specific settings
* Basic setup instructions

You handle deployment in your own environment.

## 2. Workflow + Deployment — ₹7,999 Extra

For clients who want the setup handled for them.

You receive everything in the Workflow Package plus:

* n8n deployment
* PostgreSQL / Supabase setup
* Environment configuration
* Credential configuration
* Workflow import
* End-to-end testing
* Basic handover documentation

Deployment fee: ₹7,999 one-time.

The deployment fee covers the agreed setup and testing. Ongoing hosting, monitoring, maintenance, additional changes, and third-party usage charges are separate unless agreed in advance.

### Supported Deployment Environments

Deployment may use managed or graphical cloud environments such as:

* Railway
* Render
* n8n Cloud
* Supabase / PostgreSQL

Pure VPS environments are not included, including:

* DigitalOcean
* Linode
* AWS EC2
* Hetzner
* Similar unmanaged VPS setups

## Pricing

The workflow package price depends on the selected configuration and delivery scope.

Deployment is available for an additional one-time fee of ₹7,999.

The final price may also depend on:

* Client-specific customization
* Hosting requirements
* Third-party services
* API usage
* Additional development
* Ongoing support

## Customization

The standard package includes configuration for the client's website and business requirements.

Full workflow-level customization is also available as a separate service.

Examples include:

* Changing notification formats
* Adding CRM integrations
* Adding or modifying qualification logic
* Changing scoring and routing behavior
* Adding workflow steps
* Connecting additional APIs
* Modifying enrichment or AI processing
* Creating business-specific automation branches

Customization pricing and delivery time depend on the requested changes, implementation effort, and testing requirements.

## Current V1 Scope

The current V1 includes:

* Website signal capture
* New and returning lead identification
* Personal and enterprise classification
* Deterministic lead scoring
* Returning-lead frequency scoring
* Keyword-based rescue logic
* Configurable enrichment
* Metadata enrichment fallback
* AI-assisted sales context
* Slack notifications
* PostgreSQL storage
* Event idempotency
* System error handling

## Future Versions

Future versions may include additional capabilities based on client requirements and product development priorities.

Possible additions include:

* Custom dashboards
* CSV export
* Database retention and management
* CRM integrations
* Additional reporting
* Expanded lead-routing features
* More enrichment and notification options

Future additions are not included in V1 unless explicitly agreed.

## Limitations

Lead Engine depends on external services and website structure.
Changes to the client's website may require selector or signal updates.
External providers may change their pricing, limits, availability, APIs, or behavior independently of Lead Engine.
Metadata enrichment may fail or return incomplete information when websites use dynamic rendering, access restrictions, missing metadata, or changing page structures.
Scoring and qualification should be tuned to the business model and lead patterns of each deployment.
AI-generated sales context is assistive and should not be treated as an authoritative source of truth.

## Security and Privacy

Lead Engine may process lead identity, contact information, company information, and website interaction data.
The client is responsible for determining the appropriate privacy, consent, retention, access-control, and compliance requirements for their deployment.
API keys, passwords, database credentials, and webhook secrets should be stored through the deployment environment or n8n credential system and should not be exposed in public package files.

## Delivery

Before delivery, the agreed configuration is checked for:

* Client-specific settings
* Website signal mapping
* Webhook configuration
* Required credentials
* Database setup
* Workflow import
* End-to-end processing
* Slack notifications
* Known limitations

Testing applies to the agreed configuration and deployment conditions. It does not guarantee compatibility with every hosting provider, website, third-party service, traffic level, or future software version.

## V1 Philosophy

One configurable engine. Different businesses.
The core engine remains stable.
The configuration adapts to the business.


