export const scheduleSchema=`CREATE TABLE study_schedules(name text PRIMARY KEY,next_run timestamptz NOT NULL,completed integer NOT NULL DEFAULT 0);
 CREATE TABLE study_runs(name text NOT NULL,slot timestamptz NOT NULL,PRIMARY KEY(name,slot));`;
export async function tick(pool,work){
 const client=await pool.connect();
 try{
  await client.query('BEGIN');await client.query("SET LOCAL statement_timeout='2s'");await client.query("SET LOCAL idle_in_transaction_session_timeout='5s'");
  const row=(await client.query('SELECT name,next_run FROM study_schedules WHERE next_run<=statement_timestamp() ORDER BY next_run,name LIMIT 1 FOR UPDATE SKIP LOCKED')).rows[0];
  if(!row){await client.query('COMMIT');return false;}
  const inserted=await client.query('INSERT INTO study_runs VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING name',[row.name,row.next_run]);
  if(inserted.rowCount)await work(client,row);
  await client.query("UPDATE study_schedules SET next_run=next_run+interval '1 hour',completed=completed+1 WHERE name=$1",[row.name]);
  await client.query('COMMIT');return true;
 }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
