using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace Ducademy.Database
{
    public class DBConnnection
    {
        public string ConnectionString { get; set; }
        protected DBConnnection(string connectionString)
        {
            this.ConnectionString = connectionString;
        }
        protected MySqlConnection GetConnection()
        {
            return new MySqlConnection(ConnectionString);
        }
    }
}
