export const acceptLog = async (req, res) => {
  try {
    console.log("req.body");
    console.log(req.body);
    return res.status(200).json({ message: "Log accepted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
