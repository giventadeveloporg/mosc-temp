# 🚨 URGENT: Backend Fix Required - PostgreSQL Enum Type Casting

## The Problem

When creating a tenant email address, the backend throws this error:

```
ERROR: column "email_type" is of type tenant_email_type but expression is of type character varying
Hint: You will need to rewrite or cast the expression.
```

## Root Cause

The JPA entity `TenantEmailAddress` is not properly configured to work with PostgreSQL's custom ENUM type `tenant_email_type`. It's sending the enum value as a plain string instead of properly casting it to the database enum type.

## The Fix

### Option 1: Add Column Definition (Simplest)

**File:** `E:\project_workspace\malayalees-us-site-boot\src\main\java\com\nextjstemplate\domain\TenantEmailAddress.java`

```java
@Enumerated(EnumType.STRING)
@Column(name = "email_type", nullable = false, columnDefinition = "tenant_email_type")
private TenantEmailType emailType;
```

**Change:** Add `columnDefinition = "tenant_email_type"` to the `@Column` annotation.

### Option 2: Create Custom Converter (More Control)

**Step 1:** Create the converter class

**File:** `src/main/java/com/nextjstemplate/domain/converter/TenantEmailTypeConverter.java`

```java
package com.nextjstemplate.domain.converter;

import com.nextjstemplate.domain.enumeration.TenantEmailType;
import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

@Converter(autoApply = true)
public class TenantEmailTypeConverter implements AttributeConverter<TenantEmailType, String> {
    
    @Override
    public String convertToDatabaseColumn(TenantEmailType attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }
    
    @Override
    public TenantEmailType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        try {
            return TenantEmailType.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Unknown tenant_email_type value: " + dbData, e
            );
        }
    }
}
```

**Step 2:** Update the entity

**File:** `E:\project_workspace\malayalees-us-site-boot\src\main\java\com\nextjstemplate\domain\TenantEmailAddress.java`

```java
import com.nextjstemplate.domain.converter.TenantEmailTypeConverter;

@Enumerated(EnumType.STRING)
@Column(name = "email_type", nullable = false)
@Convert(converter = TenantEmailTypeConverter.class)
private TenantEmailType emailType;
```

## Recommended Approach

**Use Option 1** (add `columnDefinition`) - it's simpler and sufficient for this use case.

## Complete Entity Field Example

```java
package com.nextjstemplate.domain;

import com.nextjstemplate.domain.enumeration.TenantEmailType;
import javax.persistence.*;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "tenant_email_addresses")
public class TenantEmailAddress implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Size(max = 255)
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @NotNull
    @Size(max = 255)
    @Email
    @Column(name = "email_address", nullable = false)
    private String emailAddress;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "email_type", nullable = false, columnDefinition = "tenant_email_type")
    private TenantEmailType emailType;

    @Size(max = 255)
    @Column(name = "display_name")
    private String displayName;

    @NotNull
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @NotNull
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @NotNull
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // Getters and setters...
}
```

## Testing After Fix

1. **Rebuild the backend:**
   ```bash
   cd E:\project_workspace\malayalees-us-site-boot
   ./mvnw clean package -DskipTests
   ```

2. **Restart the backend server:**
   ```bash
   ./mvnw spring-boot:run
   ```

3. **Test in frontend:**
   - Navigate to `http://localhost:3001/admin/email-configuration`
   - Click "Add New Email"
   - Fill in the form:
     - Email: `sales@example.com`
     - Type: `SALES`
     - Display Name: `Sales Team`
   - Click "Save"
   - Should see: "✅ Email address created successfully!"

4. **Verify in database:**
   ```sql
   SELECT * FROM tenant_email_addresses WHERE email_address = 'sales@example.com';
   ```

## Frontend Changes Made

The frontend now shows friendly error messages:

- ❌ **Before:** `ERROR: column "email_type" is of type tenant_email_type but expression is of type character varying...`
- ✅ **After:** `Invalid email type selected. Please contact support if this persists.`

See: `documentation/email-configuration-error-handling.md` for details.

## Summary

✅ **Frontend**: Already fixed with friendly error messages  
⚠️ **Backend**: Needs the `columnDefinition = "tenant_email_type"` fix  
📝 **Testing**: Follow steps above to verify

## Priority

🔴 **HIGH** - This blocks all tenant email address creation functionality.

Fix this before testing the email configuration feature.


