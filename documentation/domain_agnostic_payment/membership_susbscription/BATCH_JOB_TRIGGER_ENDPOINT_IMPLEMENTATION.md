# Implementation Prompt: Batch Job Trigger Endpoint

## Project Location

**Backend Project**: `E:\project_workspace\malayalees-us-site-boot`

The endpoint `POST /api/cron/subscription-renewal` should be implemented in the **Backend Project** (Spring Boot REST API), not in the batch job project.

## Architecture Context

- **Backend Project** (`malayalees-us-site-boot`): Spring Boot REST API running on ECS
  - Handles webhooks, REST endpoints, user operations
  - Should expose endpoint to trigger batch jobs

- **Batch Job Project** (`event-site-manager-batch-jobs`): Spring Batch application running on AWS Batch
  - Contains the actual batch job logic
  - Runs jobs when triggered by AWS Batch
  - Does NOT expose REST APIs (runs as scheduled/triggered jobs)

## Endpoint Specification

### Endpoint Details

- **Path**: `POST /api/cron/subscription-renewal`
- **Location**: Backend Project (`malayalees-us-site-boot`)
- **Purpose**: Trigger subscription renewal batch job on demand (for testing and manual execution)

### Request Specification

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
X-Tenant-Id: <tenant_id> (optional, can be in body)
```

**Request Body:**
```json
{
  "tenantId": "tenant_demo_002",           // Optional: filter by tenant
  "stripeSubscriptionId": "sub_xxx",      // Optional: filter by specific subscription
  "batchSize": 100,                        // Optional: batch size (default: 100)
  "maxSubscriptions": 10000                // Optional: max subscriptions to process (default: 10000)
}
```

**All fields are optional** - if not provided, process all subscriptions for all tenants.

### Response Specification

**Success Response (200 OK):**
```json
{
  "status": "success",
  "jobId": "job-1234567890",              // AWS Batch job ID
  "jobName": "subscription-renewal-2025-01-15-20-30-00",
  "message": "Batch job submitted successfully",
  "estimatedDuration": "15-30 minutes",
  "request": {
    "tenantId": "tenant_demo_002",
    "batchSize": 100,
    "maxSubscriptions": 10000
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "status": "error",
  "error": "Invalid request",
  "message": "Validation error details"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "status": "error",
  "error": "Unauthorized",
  "message": "Invalid or missing authentication"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "status": "error",
  "error": "Internal server error",
  "message": "Failed to submit batch job",
  "details": "Error details"
}
```

## Implementation Requirements

### 1. Controller/Resource Class

**Location**: `src/main/java/com/yourcompany/web/rest/BatchJobResource.java` (or similar)

**Requirements:**
- Use Spring Boot REST controller
- Follow existing REST resource patterns in the project
- Support JWT authentication (use existing auth mechanism)
- Support optional cron secret authentication (for scheduled triggers)
- Validate request body
- Handle tenant context (if multi-tenant)

### 2. Service Layer

**Location**: `src/main/java/com/yourcompany/service/BatchJobService.java`

**Responsibilities:**
- Submit job to AWS Batch using AWS SDK
- Build job parameters from request
- Handle AWS Batch API calls
- Return job submission status

### 3. AWS Batch Integration

**Required AWS SDK Dependencies:**
```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>batch</artifactId>
    <version>2.20.0</version>
</dependency>
```

**Configuration:**
- AWS credentials (IAM role or credentials)
- AWS region configuration
- Batch job definition name
- Batch job queue name

### 4. Job Submission Logic

**Steps:**
1. Validate request parameters
2. Build job parameters (environment variables for Spring Batch)
3. Submit job to AWS Batch using `SubmitJobRequest`
4. Return job submission result

**Job Parameters (Environment Variables for Spring Batch):**
```java
Map<String, String> environmentVariables = new HashMap<>();
environmentVariables.put("JOB_NAME", "subscriptionRenewalJob");
environmentVariables.put("TENANT_ID", request.getTenantId()); // Optional
environmentVariables.put("BATCH_SIZE", String.valueOf(request.getBatchSize()));
environmentVariables.put("MAX_SUBSCRIPTIONS", String.valueOf(request.getMaxSubscriptions()));
if (request.getStripeSubscriptionId() != null) {
    environmentVariables.put("STRIPE_SUBSCRIPTION_ID", request.getStripeSubscriptionId());
}
```

### 5. Authentication

**Support Two Methods:**

**Method 1: JWT Authentication (for manual triggers)**
- Use existing JWT authentication mechanism
- Extract user/tenant from JWT token
- Allow authenticated users to trigger jobs

**Method 2: Cron Secret (for scheduled triggers)**
- Check for `CRON_SECRET` environment variable
- Compare with `Authorization: Bearer <CRON_SECRET>` header
- Used by external cron services (EventBridge, etc.)

### 6. Error Handling

**Handle These Scenarios:**
- AWS Batch service unavailable
- Invalid job definition or queue
- IAM permissions issues
- Invalid request parameters
- Rate limiting (if applicable)

### 7. Logging

**Log the Following:**
- Job submission requests (with parameters)
- Job submission success/failure
- AWS Batch job IDs
- Errors and exceptions

## Implementation Example Structure

### Controller Example

```java
@RestController
@RequestMapping("/api/cron")
public class BatchJobResource {

    private final BatchJobService batchJobService;
    private final Logger log = LoggerFactory.getLogger(BatchJobResource.class);

    @PostMapping("/subscription-renewal")
    public ResponseEntity<BatchJobResponse> triggerSubscriptionRenewal(
            @RequestBody(required = false) BatchJobRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantIdHeader
    ) {
        // 1. Authenticate (JWT or cron secret)
        authenticateRequest(authHeader);

        // 2. Build request from body or headers
        BatchJobRequest jobRequest = buildRequest(request, tenantIdHeader);

        // 3. Validate request
        validateRequest(jobRequest);

        // 4. Submit job
        BatchJobResponse response = batchJobService.submitSubscriptionRenewalJob(jobRequest);

        return ResponseEntity.ok(response);
    }

    private void authenticateRequest(String authHeader) {
        // Check for cron secret
        String cronSecret = System.getenv("CRON_SECRET");
        if (cronSecret != null && authHeader != null &&
            authHeader.equals("Bearer " + cronSecret)) {
            return; // Cron secret auth successful
        }

        // Otherwise, use JWT authentication (existing mechanism)
        // ... existing JWT auth logic
    }
}
```

### Service Example

```java
@Service
public class BatchJobService {

    private final BatchClient batchClient;
    private final String jobDefinitionName;
    private final String jobQueueName;
    private final Logger log = LoggerFactory.getLogger(BatchJobService.class);

    public BatchJobResponse submitSubscriptionRenewalJob(BatchJobRequest request) {
        try {
            // Build job name
            String jobName = "subscription-renewal-" +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HH-mm-ss"));

            // Build environment variables
            Map<String, String> environment = buildEnvironmentVariables(request);

            // Build job parameters
            SubmitJobRequest submitRequest = SubmitJobRequest.builder()
                .jobName(jobName)
                .jobDefinition(jobDefinitionName)
                .jobQueue(jobQueueName)
                .parameters(buildJobParameters(request))
                .containerOverrides(ContainerOverrides.builder()
                    .environment(environment)
                    .build())
                .build();

            // Submit job
            SubmitJobResponse response = batchClient.submitJob(submitRequest);

            log.info("Submitted subscription renewal batch job: jobId={}, jobName={}, tenantId={}",
                response.jobId(), jobName, request.getTenantId());

            return BatchJobResponse.builder()
                .status("success")
                .jobId(response.jobId())
                .jobName(jobName)
                .message("Batch job submitted successfully")
                .estimatedDuration("15-30 minutes")
                .request(request)
                .build();

        } catch (Exception e) {
            log.error("Failed to submit batch job", e);
            throw new BatchJobException("Failed to submit batch job: " + e.getMessage(), e);
        }
    }

    private Map<String, String> buildEnvironmentVariables(BatchJobRequest request) {
        Map<String, String> env = new HashMap<>();
        env.put("JOB_NAME", "subscriptionRenewalJob");

        if (request.getTenantId() != null) {
            env.put("TENANT_ID", request.getTenantId());
        }
        if (request.getBatchSize() != null) {
            env.put("BATCH_SIZE", String.valueOf(request.getBatchSize()));
        }
        if (request.getMaxSubscriptions() != null) {
            env.put("MAX_SUBSCRIPTIONS", String.valueOf(request.getMaxSubscriptions()));
        }
        if (request.getStripeSubscriptionId() != null) {
            env.put("STRIPE_SUBSCRIPTION_ID", request.getStripeSubscriptionId());
        }

        return env;
    }
}
```

## DTOs Required

### BatchJobRequest
```java
public class BatchJobRequest {
    private String tenantId;
    private String stripeSubscriptionId;
    private Integer batchSize;
    private Integer maxSubscriptions;

    // Getters and setters
}
```

### BatchJobResponse
```java
public class BatchJobResponse {
    private String status;
    private String jobId;
    private String jobName;
    private String message;
    private String estimatedDuration;
    private BatchJobRequest request;

    // Getters and setters
}
```

## AWS Configuration

### Environment Variables Required

```bash
AWS_REGION=us-east-1
AWS_BATCH_JOB_DEFINITION=subscription-renewal-job-definition
AWS_BATCH_JOB_QUEUE=subscription-renewal-queue
CRON_SECRET=your-secret-key-here  # Optional, for cron authentication
```

### IAM Permissions Required

The backend service's IAM role needs:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "batch:SubmitJob",
        "batch:DescribeJobs",
        "batch:ListJobs"
      ],
      "Resource": "*"
    }
  ]
}
```

## Testing

### Manual Testing

```bash
# Get JWT token
curl -X POST http://localhost:8080/api/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"jwtadmin","password":"jwtadmin","rememberMe":true}'

# Trigger batch job
curl -X POST http://localhost:8080/api/cron/subscription-renewal \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant_demo_002",
    "batchSize": 10,
    "maxSubscriptions": 100
  }'
```

### Integration with Test Script

The test script `scripts/test-subscription-renewal/trigger-batch-job.js` will call this endpoint automatically.

## Related Documentation

- **Architecture**: See `SUBSCRIPTION_RENEWAL_BATCH_JOB_ANALYSIS.html` Section 5 (AWS Deployment Architecture)
- **Batch Job Project**: `E:\project_workspace\event-site-manager-batch-jobs`
- **Database Schema**: `code_html_template/SQLS/Current_Sqls/Latest_Schema_Post__Blob_Claude_12.sql`
- **API Documentation**: `documentation/Swagger_API_Docs/api-docs.json`
- **Next.js API Rules**: `.cursor/rules/nextjs_api_routes.mdc`

## Notes

1. **This endpoint is in the Backend Project**, not the batch job project
2. The batch job project runs the actual job logic when triggered by AWS Batch
3. This endpoint acts as a trigger/orchestrator that submits jobs to AWS Batch
4. The endpoint should be idempotent (can be called multiple times safely)
5. Consider rate limiting if needed to prevent abuse
6. Add monitoring/alerting for job submission failures



