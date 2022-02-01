using Microsoft.AspNetCore.SignalR;
using Ducademy.SSH;
using Renci.SshNet;
using System.Text;
using Ducademy;
namespace Ducademy.Hubs
{
    public class Debuggerhub : Hub
    {
        //private static GDB gdb = new(Directory.GetCurrentDirectory() + "\\Secret\\ducamiJJang.pem");
        private static GDB gdb = new(Dirpaths.SSHpemFile);

        public async Task StartMessage(int _userid)
        {
            if (Int32.Parse(Context.User.FindFirst("id").Value) != _userid)
            {
                await Clients.Caller.SendAsync("ReceiveMessage", "Error Occur");
                return;
            }
            if(gdb.FindShellAsId(_userid) != null)
            {
                gdb.RemoveShell(_userid);
                gdb.RemoveShell(_userid << 8);
            }
            try { 
                gdb.NewShell(_userid); //기본적인 통신용 쉘
                gdb.NewShell(_userid << 8); //tty이용해 프로그램 입출력을 위한 쉘 
            }
            catch (Exception ex) { Console.WriteLine(ex.Message); return; }
            await Clients.Caller.SendAsync("ReceiveMessage", "We are Connected");
        }


        public async Task RunCode(string _code)
        {
            int userid = Int32.Parse(Context.User.FindFirst("id").Value);
            gdb.SendCode(userid, _code);
            string str = gdb.StartGDB(userid);
            str = str[(str.LastIndexOf("line") + 5)..str.LastIndexOf('.')];
            await Clients.Caller.SendAsync("StackDatas",
                str.Split(' ')[0],
                string.Join('\n', gdb.AllStackVarables(userid)));
        }

        public async Task ExecuteGdbCmd(string _command)
        {
            string str = gdb.ExecuteGDBCmd(Int32.Parse(Context.User.FindFirst("id").Value), _command);
            str = str.Substring(_command.Length, 3);
            await Clients.Caller.SendAsync("StackDatas",
                str,
                string.Join('\n', gdb.AllStackVarables(Int32.Parse(Context.User.FindFirst("id").Value))));

            StreamReader sr = new StreamReader(gdb.FindShellAsId(Int32.Parse(Context.User.FindFirst("id").Value) << 8));
            string strng = sr.ReadToEnd();
            if (strng != "")
            {
                await Clients.Caller.SendAsync("standardOut", strng);
            }
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            gdb.RemoveShell(Int32.Parse(Context.User.FindFirst("id").Value));
            return Task.CompletedTask;
        }
    }
}
