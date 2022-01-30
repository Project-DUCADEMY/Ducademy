namespace Ducademy
{
    public static class Dirpaths
    {
        public static string RootDir = Directory.GetCurrentDirectory();
        public static string CacheFolder = RootDir + "\\CacheFolder";
        public static string UsercodeDir = CacheFolder + "\\usercode";
        public static string SSHpemFile = UsercodeDir + "\\ducamiJJang.pem";
    }
}
