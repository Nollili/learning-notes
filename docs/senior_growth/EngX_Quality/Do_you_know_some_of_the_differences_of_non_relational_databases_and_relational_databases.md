### Do you know some of the differences of non relational databases and relational databases?

Yes, relational databases (RDBMS) and non-relational databases (NoSQL) differ in several key aspects related to their data models, structure, scalability, and usage. Here’s a comparison:

### **1. Data Model**

- **Relational Databases (RDBMS)**:
    - **Structured Data**: Data is stored in tables with predefined schemas consisting of rows and columns.
    - **Schema-based**: Uses declared types/constraints that can evolve through migrations. Foreign keys can enforce relationships; JSON columns can hold semistructured data.
    - **Examples**: MySQL, PostgreSQL, Oracle, Microsoft SQL Server.
- **Non-relational Databases (NoSQL)**:
    - **Flexible Schema**: Can handle unstructured, semi-structured, or structured data. Some NoSQL databases are schema-less or allow dynamic schema.
    - **Data Types**: NoSQL databases support various models like key-value pairs, document stores, wide-column stores, and graph databases.
    - **Examples**: MongoDB (document), Cassandra (wide-column), Redis (key-value), Neo4j (graph).

---

### **2. Data Structure**

- **Relational Databases (RDBMS)**:
    - **Tables**: Data is stored in tables with rows (records) and columns (attributes).
    - **Relationships**: Supports relationships between tables using **Primary Keys** and **Foreign Keys**.
    - **Normalization**: Data is typically normalized to minimize redundancy and ensure data integrity.
- **Non-relational Databases (NoSQL)**:
    - **Key-Value Stores**: Data is stored as key-value pairs, useful for fast lookups.
    - **Document Stores**: Data is stored as documents (often JSON or BSON), which can have nested structures.
    - **Wide-Column Stores**: Data is stored in rows and columns, but columns are grouped into families, providing more flexibility.
    - **Graph Databases**: Data is stored in graphs with nodes, edges, and properties, used for connected data.
    - **Flexible Schema**: NoSQL databases can store data without a fixed schema, which can be beneficial for evolving datasets.

---

### **3. Scalability**

- **Relational Databases (RDBMS)**:
    - **Scaling options**: Vertical resources, indexes/query design, replicas, partitioning and, for suitable products/designs, sharding/distributed SQL.
    - **Trade-offs**: Cross-partition joins/transactions, replication lag, hotspots and operational cost depend on product/topology/workload.
- **Non-relational Databases (NoSQL)**:
    - **Horizontal scaling**: Some products support native distribution; partition-key design, hotspots and coordination still constrain throughput.
    - **Workload fit**: Document/key-value/graph access patterns may fit a given workload; category labels do not establish lower latency or cost.

---

### **4. Consistency and Transactions**

- **Relational Databases (RDBMS)**:
    - **ACID Compliance**: RDBMS follow **ACID** (Atomicity, Consistency, Isolation, Durability) principles to ensure reliable transactions.
    - **Isolation/replication**: Guarantees depend on the isolation level and read path; a lagging replica or Read Committed transaction is not universally linearizable/serializable.
    - **Transactions**: Supports complex transactions with multiple operations that can be rolled back if needed.
- **Non-relational Databases (NoSQL)**:
    - **Configurable guarantees**: Products differ. MongoDB exposes read/write concerns and distributed transactions; some deployments/read choices allow stale or rollback-prone observations.
    - **CAP**: During network partitions, a system cannot guarantee both linearizable reads/writes and successful service of every request at nonfailing nodes. This applies to distributed SQL and NoSQL; it does not label all NoSQL as AP.
    - **Transactions**: MongoDB supports multi-document transactions across collections/shards under supported deployment/settings; Neo4j provides ACID transactions. Check actual scope/isolation/durability rather than assuming no comparable transactions.

---

### **5. Querying and Flexibility**

- **Relational Databases (RDBMS)**:
    - **SQL**: Uses **Structured Query Language (SQL)** for querying, which is powerful and standardized across relational systems.
    - **Complex Queries**: RDBMS are ideal for complex queries with multiple joins, subqueries, and aggregations.
    - **Declared schema**: Migrations/constraints make structure explicit; model evolution and JSON support remain available.
- **Non-relational Databases (NoSQL)**:
    - **Varied Query Languages**: NoSQL databases have different query languages and methods depending on the database type (e.g., MongoDB uses a query language that operates on documents, while Redis uses simple key-based queries).
    - **Schema-less**: NoSQL allows for flexible data models that can evolve over time, which is useful for applications with rapidly changing data.
    - **Query fit**: Join/aggregation/traversal capabilities vary; graph traversal may be more natural in a graph store, while document embedding changes update/query trade-offs.

---

### **6. Use Cases**

- **Relational Databases (RDBMS)**:
    - **Best for structured data**: Applications that require structured data and relationships, such as financial systems, ERP systems, and transactional applications.
    - **Strong Data Integrity**: Ideal for applications that require strong consistency and ACID transactions (e.g., banking, inventory systems).
- **Non-relational Databases (NoSQL)**:
    - **Big Data**: Well-suited for handling large volumes of unstructured or semi-structured data, such as social media platforms, IoT data, and logs.
    - **Real-Time Applications**: Often used in applications that require fast data ingestion and retrieval, such as real-time analytics, recommendation engines, and content management systems.
    - **Flexible and Evolving Data**: Ideal for applications with evolving data structures, where the schema may change over time, like e-commerce platforms, content management, and social media apps.

---

### **7. Performance**

- **Relational Databases (RDBMS)**:
    - **Optimized for Transactional Workloads**: RDBMS are optimized for transactional workloads where data integrity is critical.
    - **Complex Queries**: RDBMS tend to perform well for complex queries, aggregations, and data analysis.
- **Non-relational Databases (NoSQL)**:
    - **Distribution costs**: A partitionable workload can scale on a suitable product, but balancing, coordination and failure recovery must be designed/tested.
    - **Write behavior**: Indexes, acknowledgment/durability settings, contention and replication determine latency/throughput; measure against the required guarantees.

---

### **8. Examples and Specifics**

- **Relational Databases (RDBMS)**:
    - **MySQL**: Popular for web applications and content management systems.
    - **PostgreSQL**: Known for its strong consistency and extensibility, used in analytics, geospatial data, and more.
    - **Oracle Database**: Enterprise-level RDBMS widely used for business applications with complex requirements.
- **Non-relational Databases (NoSQL)**:
    - **MongoDB**: A document store with explicit document/index/distribution and read/write-concern choices.
    - **Cassandra**: A distributed, wide-column store designed for high availability and massive scalability.
    - **Redis**: A fast, in-memory key-value store often used for caching, session storage, and real-time analytics.
    - **Neo4j**: A graph database used to store data in a graph format (e.g., for social networks, fraud detection).

---

### **Summary Table**

| **Aspect** | **Relational Databases (RDBMS)** | **Non-relational Databases (NoSQL)** |
| --- | --- | --- |
| **Data Structure** | Tables, rows, columns | Flexible structures (documents, key-value, graphs, wide-column) |
| **Schema** | Declared/evolvable; JSON possible | Product-specific validation/evolution |
| **Query Language** | SQL | Varies (depends on DB type) |
| **Scalability** | Product/topology/partition/query dependent | Product/topology/partition/query dependent |
| **Consistency** | Isolation/read-replica choices matter | Read/write concerns and topology matter |
| **Transactions** | Usually multi-row/table transactions; check isolation | Some support ACID multi-record transactions; check scope/settings |
| **Selection** | Choose invariant/query/isolation/topology fit | Choose invariant/query/isolation/topology fit |
| **Examples** | MySQL, PostgreSQL, Oracle | MongoDB, Cassandra, Redis, Neo4j |

---

## Choose guarantees for a concrete workload

ACID consistency means preserving declared invariants through valid transactions; it is not CAP's linearizability. Availability in the CAP model is not the same as a monthly uptime SLO or returning an error response. A deployment can deliberately reject an isolated partition's writes to protect its consistency contract. Eventual convergence requires its own conflict/repair assumptions and does not mean every database operation is equally stale.

For the primary inventory learning app, PostgreSQL16 is a coherent default: explicit product/tenant/SKU constraints, atomic stock changes and transactional use cases. MongoDB remains a substantive alternative exercise when the document aggregate/access pattern is appropriate; Neo4j is an introduction to graph-oriented trade-offs, not an additional required production stack. NoSQL still needs schema validation, indexes, migration/backfill strategy and tested backups.

**Worked decision:** stock for a tenant/SKU must never become negative and duplicate SKUs must be rejected. Write the invariant, choose a unique tenant/SKU constraint and an atomic conditional update inside the required transaction boundary, then verify two simultaneous decrements. A product catalog page may tolerate a deliberately stale read/cache; checkout cannot silently reuse that weaker contract. A different data model does not remove either invariant or its concurrency test.


References checked2026-10-22: [MongoDB transactions](https://www.mongodb.com/docs/manual/core/transactions/), [MongoDB read concern](https://www.mongodb.com/docs/manual/reference/read-concern/), [Neo4j transactions](https://neo4j.com/docs/operations-manual/current/database-internals/transaction-management/), [PostgreSQL16 isolation](https://www.postgresql.org/docs/16/transaction-iso.html), [Gilbert/Lynch CAP model](https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer6.pdf).


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/design/Do_you_know_some_of_the_differences_of_non_relational_databases_and_relational_databases.md). All learner practice remains outstanding.
