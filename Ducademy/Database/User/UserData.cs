using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace Ducademy.Database
{
    public class UserData
    {
        public UserData(string _email, string _password, string _name)
        {
            Email = _email;
            Password = _password;
            Name = _name;
        }
        public UserData(int _id, string _email, string _password, string _name)
        {
            Id = _id;
            Email = _email;
            Password = _password;
            Name = _name;
        }
        public int Id { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
    }
}
