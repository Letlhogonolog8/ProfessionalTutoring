import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Smartphone, Link as LinkIcon, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function MobileAccess() {
  const [currentUrl, setCurrentUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [tabValue, setTabValue] = useState("qrcode");

  useEffect(() => {
    // Get the current URL
    setCurrentUrl(window.location.origin);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="hover-up"
    >
      <Card className="w-full max-w-md shadow-lg glow-border overflow-hidden">
        <CardHeader className="pb-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <CardTitle className="flex items-center text-lg font-medium">
              <Smartphone className="mr-2 h-5 w-5 text-primary" />
              Access on Mobile Device
            </CardTitle>
            <CardDescription>
              Scan the QR code or use the link to open the app on your mobile device
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent>
          <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="qrcode" className="transition-all duration-300">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-1"
                >
                  <span>QR Code</span>
                </motion.div>
              </TabsTrigger>
              <TabsTrigger value="link" className="transition-all duration-300">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-1"
                >
                  <span>Direct Link</span>
                </motion.div>
              </TabsTrigger>
            </TabsList>
            
            <AnimatePresence mode="wait">
              {tabValue === "qrcode" && (
                <TabsContent value="qrcode" className="py-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-center"
                  >
                    <div className="p-4 bg-white rounded-lg shadow-inner animate-pulse-glow">
                      <QRCodeSVG 
                        value={currentUrl} 
                        size={200} 
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"L"}
                        includeMargin={false}
                      />
                    </div>
                  </motion.div>
                </TabsContent>
              )}

              {tabValue === "link" && (
                <TabsContent value="link" className="py-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="p-4 bg-muted rounded-md w-full break-all text-center border border-border">
                      <a 
                        href={currentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary flex items-center justify-center gap-2 hover:underline"
                      >
                        <LinkIcon className="h-4 w-4" />
                        <span className="font-medium">{currentUrl}</span>
                      </a>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="outline" 
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 transition-all duration-300"
                      >
                        <AnimatePresence mode="wait">
                          {copied ? (
                            <motion.div
                              key="copied"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center gap-2"
                            >
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="text-green-500">Copied!</span>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="copy"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center gap-2"
                            >
                              <Copy className="h-4 w-4" />
                              <span>Copy Link</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </motion.div>
                  </motion.div>
                </TabsContent>
              )}
            </AnimatePresence>
          </Tabs>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-muted-foreground mt-4"
          >
            For the best experience, we recommend using the latest version of Chrome, Safari, or Firefox.
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
}