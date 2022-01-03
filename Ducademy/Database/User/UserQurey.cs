using MySql.Data.MySqlClient;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace Ducademy.Database
{
    public class UserQurey : DBConnnection
    {
        public UserQurey(string connectionString) : base(connectionString)
        {
        }
        public string Signup(UserData userdata)
        {
            if (Exist("email", userdata.Email))
            {
                return "Email Already Exist";
            }//이메일이 이미 존재하는지 판단하여 사용가능 여부를 반환
            else
            {
                string test = "{" + '"' + "name" + '"' + " : " + '"' + $"{userdata.Name}" + '"' + '}';
                Console.Write(test);
                string SQLqurey = $"insert into user (email, password, name, info)values(" +
                    $"'{userdata.Email}', '{ConvertPassword(userdata.Password)}', '{userdata.Name}', '{test}');";
                Console.WriteLine(SQLqurey);
                using (MySqlConnection conn = GetConnection())
                {
                    try
                    {
                        conn.Open();
                        MySqlCommand command = new MySqlCommand(SQLqurey, conn);
                        Console.WriteLine("Sign up " + (command.ExecuteNonQuery() == 1 ?
                            "success" : "fail"));
                    }
                    catch (Exception exception)
                    {
                        Console.WriteLine(exception.ToString());
                        return exception.ToString();
                    }
                    conn.Close();
                    return "/";
                }
            }
        }
        //회원가입 함수 회원가입에 성공하면 문자열 OK를 반환

        public int Signin(UserData userdata)
        {
            int ret;
            string SQLqurey = $"select id from user where email = '{userdata.Email}' AND " +
                $"password = '{ConvertPassword(userdata.Password)}';";
            using (MySqlConnection conn = GetConnection())
            {
                try
                {
                    conn.Open();
                    MySqlCommand command = new MySqlCommand(SQLqurey, conn);
                    using (var reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                            ret = reader.GetInt32("id");
                        else
                            ret = 0;
                    }
                }
                catch(Exception exception)
                {
                    Console.WriteLine(exception.ToString());
                    return -1;
                }
                conn.Close();
            }
            return ret;
        }


        private bool Exist(string type, string name)
        {
            bool ret;
            string SQLqurey = $"select {type} from user where {type} = '{name}';";
            using (MySqlConnection conn = GetConnection())
            {
                conn.Open();
                MySqlCommand command = new MySqlCommand(SQLqurey, conn);
                using (var reader = command.ExecuteReader())
                {
                    ret = reader.Read();
                }
                conn.Close();
            }
            return ret;
        }
        //특정 타입에 특정 이름을 가진 것이 테이블에 존재하는지 검사하는 함수

        private string ConvertPassword(string password)
        {
            var sha = new System.Security.Cryptography.HMACSHA512();
            sha.Key = System.Text.Encoding.UTF8.GetBytes(password.Length.ToString());
            var hash = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hash);
        }
        //비밀번호를 넣으면 암호화된 비밀번호를 반환하는 함수
    }
}
