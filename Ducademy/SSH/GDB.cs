using Renci.SshNet;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Threading;
using Renci.SshNet.Sftp;
using Renci.SshNet.Common;
namespace Ducademy.SSH
{

    public class GDB
    {
        public class ClangData
        {
            private struct NameNVal
            {
                public NameNVal(string _str)
                {
                    int indexOfEqual = _str.IndexOf("=");
                    name = _str[..(indexOfEqual - 1)];
                    value = _str[(indexOfEqual + 2)..];
                }
                public string name;
                public string value;
            }
            private static byte[] HexToByte(string hex, int size)
            {
                byte[] result = new byte[size];
                result = BitConverter.GetBytes(int.Parse(hex[2..], System.Globalization.NumberStyles.HexNumber));
                return result;
            }
            private int SizeOfType(string _type)
            {
                int arrLocation = _type.IndexOf("[");
                string defaultType;

                if (arrLocation == -1)
                    defaultType = _type;
                else
                    defaultType = _type.Substring(0, arrLocation - 1);

                int defaultSize;
                switch (defaultType)
                {
                    case "char":
                    case "unsigned char":
                        defaultSize = 1; break;
                    case "short":
                    case "unsigned short":
                        defaultSize = 2; break;
                    case "int":
                    case "unsigned int":
                    case "float":
                    case "unsigned float":
                    case "long":
                    case "unsigned long":
                        defaultSize = 4; break;
                    case "double":
                    case "unsigned double":
                    case "long long":
                    case "unsigned long long":
                        defaultSize = 8; break;
                    default:
                        throw new Exception("Unknown DataType");
                }

                if (arrLocation == -1)
                    return defaultSize;
                else
                {
                    return defaultSize * Int32.Parse(_type.Substring(arrLocation + 1, _type.IndexOf("]") - (arrLocation + 1)));
                }
            }
            public ClangData(string _datatype, string _name, byte[] _data)
            {
                datatype = _datatype;
                name = _name;
                data = _data;
            }
            public ClangData(ShellStream _shell, string _input)
            {
                NameNVal nameNVal = new(_input);
                name = nameNVal.name;
                string shellCommand = $"ptype {name}\n";
                datatype = RunShellCode(_shell, shellCommand, "(gdb)");
                datatype = datatype.Substring(shellCommand.Length + 8, datatype.LastIndexOf("\r\n") - (shellCommand.Length + 8));
                datasize = SizeOfType(datatype);
                data = new byte[datasize];
                if (nameNVal.value[0] == '{')
                {
                    nameNVal.value = nameNVal.value.Substring(1, nameNVal.value.Length - 3);
                    string[] splited = nameNVal.value.Split(", ");
                    datasize = datasize / splited.Length;
                    int idx = 0;
                    foreach (var item in splited)
                    {
                        int startIdx = idx * datasize;
                        Array.Copy(HexToByte(item, datasize), 0, data, startIdx, datasize);
                        idx++;
                    }
                }
                else
                {
                    data = HexToByte(nameNVal.value, datasize);
                } 
            }
            public int Size()
            {
                return data.Length;
            }
            public string datatype;
            public int datasize;
            public string name;
            public byte[] data;
        }

        private SshClient client;
        private SftpClient sftp;
        private Dictionary<int, ShellStream> shellStreams = new();

        public ShellStream FindShellAsId(int userid)
        {
            if(shellStreams.ContainsKey(userid))
            {
                return shellStreams[userid];
            }
            else
            {
                return null;
            }
        }
        private static string ExecuteCmd(string str)
        {
            ProcessStartInfo cmd = new ProcessStartInfo();
            Process process = new Process();
            cmd.FileName = @"cmd";
            cmd.WindowStyle = ProcessWindowStyle.Hidden;             // cmd창이 숨겨지도록 하기
            cmd.CreateNoWindow = true;                               // cmd창을 띄우지 안도록 하기

            cmd.UseShellExecute = false;
            cmd.RedirectStandardOutput = true;        // cmd창에서 데이터를 가져오기
            cmd.RedirectStandardInput = true;          // cmd창으로 데이터 보내기
            cmd.RedirectStandardError = true;          // cmd창에서 오류 내용 가져오기

            process.EnableRaisingEvents = false;
            process.StartInfo = cmd;
            process.Start();
            process.StandardInput.Write(str + Environment.NewLine);
            // 명령어를 보낼때는 꼭 마무리를 해줘야 한다. 그래서 마지막에 NewLine가 필요하다
            process.StandardInput.Close();

            string result = process.StandardOutput.ReadToEnd();
            process.WaitForExit();
            process.Close();
            return result;
        }
        static async Task WriteStreamAsync(Stream _stream, string _string)
        { 
            StreamWriter streamWriter = new(_stream);
            await streamWriter.WriteAsync(_string);
            streamWriter.Flush();
        }
        static void WriteStream(Stream _stream, string _string)
        {
            StreamWriter streamWriter = new(_stream);
            streamWriter.Write(_string);
            streamWriter.Flush();
        }
        public ShellStream NewShell(int userid)
        {
            if (shellStreams.ContainsKey(userid))
            {
                return shellStreams[userid];
            }
            else
            {
                ShellStream shellStream = client.CreateShellStream("", 80, 24, 800, 600, 1024, new Dictionary<TerminalModes, uint>());
                shellStreams.Add(userid, shellStream);
                RunShellCode(shellStream, "cd usercode\n");
                return shellStream;
            } 
        }
        public bool RemoveShell(int userid)
        {
            return shellStreams.Remove(userid);
        }
        private static string RunShellCode(ShellStream _stream, string _code)
        {
            try
            {
                WriteStream(_stream, _code);
                StreamReader streamReader = new(_stream);
                string result = "";
                //Thread.Sleep(100);
                while (true)
                {
                    string val = streamReader.ReadToEnd();
                    if (val != "")
                    {
                        result += val;
                        if (result.Length >= _code.Length)
                            return result;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return ex.ToString();
            }
        }
        private static string RunShellCode(ShellStream _stream, string _code, string _waitFor)
        {
            try
            {
                WriteStream(_stream, _code);
                StreamReader streamReader = new(_stream);
                string result = "";
                //Thread.Sleep(100);
                while (true)
                {
                    string val = streamReader.ReadToEnd();
                    if (val != "")
                    {
                        result += val;
                        if (result.Contains(_waitFor))
                            return result;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return ex.ToString();
            }
        }
        public LinkedList<string> AllStackVarables(int _userid)
        {
            LinkedList<string> result = new();
            LinkedList<ClangData> list = new();
            ShellStream shell = FindShellAsId(_userid);
            string str = RunShellCode(shell, "info args\n", "(gdb)")[("info args\n\r".Length)..^6];
            foreach (var item in str.Split("\r\n"))
            {
                if (item == "" || item == "No arguments.") { break; }
                list.AddLast(new ClangData(shell, item));
            }
            str = RunShellCode(shell, "info locals\n", "(gdb)")[("info locals\n\r".Length)..^6];
            foreach (var item in str.Split("\r\n"))
            {
                if(item == "" || item == "No locals.") {  break; }
                list.AddLast(new ClangData(shell, item));
            }

            foreach(var clangData in list)
            {
                string tempStr = $"{clangData.datatype}/{clangData.name}/{BitConverter.ToString(clangData.data)}";
                result.AddLast(tempStr);
            }

            return result;
        }
        public string ExecuteGDBCmd(int _userid, string command)
        {
            return RunShellCode(FindShellAsId(_userid), command, "(gdb)");
        }
        public string SendCode(int _userid, string _code)
        {
            try
            {
                Directory.SetCurrentDirectory(Dirpaths.UsercodeDir);
                StreamWriter sw = new StreamWriter(File.Create($"{_userid}.c"));
                sw.Write(_code);
                sw.Close();
                using (var infile = File.Open($"{_userid}.c", FileMode.Open))
                {
                    sftp.UploadFile(infile, $"./usercode/{_userid}.c");
                }
                Directory.SetCurrentDirectory(Dirpaths.RootDir);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return ex.Message;
            }
            return "OK";
        }
        public string StartGDB(int _userid)
        {
            try
            {
                ShellStream shellStream = FindShellAsId(_userid);
                StreamReader streamReader = new(shellStream);
                streamReader.ReadToEnd();
                RunShellCode(shellStream, $"gcc -o {_userid}execute {_userid}.c -g\n", "$");
                RunShellCode(shellStream, $"gdb {_userid}execute\n", "(gdb)");
                RunShellCode(shellStream, "set output-radix 16\n", "(gdb)");
                string result = RunShellCode(shellStream, "break main\n", "(gdb)")[12..^6]; 
                RunShellCode(shellStream, "run\n", "(gdb)");
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return ex.Message;
            }
        }
        public GDB(string dir)
        {
            Console.WriteLine(File.Exists(dir) ? "NO" :"SEX");
            PrivateKeyFile privateKey = new(dir);
            client = new SshClient("ec2-13-209-96-128.ap-northeast-2.compute.amazonaws.com", "ec2-user", privateKey);
            sftp = new SftpClient("ec2-13-209-96-128.ap-northeast-2.compute.amazonaws.com", "ec2-user", privateKey);
            client.Connect();
            sftp.Connect();
            //shell = client.CreateShell(Console.OpenStandardInput(), Console.OpenStandardOutput(), Console.OpenStandardOutput());
            //shell.Start();
        }
        ~GDB()
        {
            client.Disconnect();
            sftp.Disconnect();
        }

    }
}
