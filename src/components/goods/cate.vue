<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showadddialog">添加分类</el-button>
        </el-col>
      </el-row>

      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        border
        class="treetable"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen;"></i>
          <i class="el-icon-error" v-else style="color:red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showeditdialog(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removebyid(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="adddialogVisible"
      width="50%"
      @close="addcatedialogclose"
    >
      <!-- 添加分类表单 -->
      <el-form
        :model="addcateform"
        :rules="addcateformrules"
        ref="addcateformref"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addcateform.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectkeys"
            :options="parentcatelist"
            :props="cascaderprops"
            @change="parentcatechange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="adddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addcate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框  -->
    <el-dialog title="修改分类" :visible.sync="editdialogVisible" width="50%" @close="editdialogclose">
      <el-form :model="editform" :rules="editformrules" ref="editformref" label-width="70px">
        <el-form-item label="分类名" prop="cat_name">
          <el-input v-model="editform.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="edituserinfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      catelist: [],
      total: 0,
      queryinfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          type: "template",
          template: "isok",
        },
        {
          label: "排序",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "opt",
        },
      ],
      adddialogVisible: false,
      addcateform: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      },
      addcateformrules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      parentcatelist: [],
      cascaderprops: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true,
      },
      //   选中的父级分类id数组
      selectkeys: [],
      editform: {},
      editdialogVisible: false,
      editformrules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getcatelist();
  },
  methods: {
    async getcatelist() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryinfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败！");
      }
      console.log(res.data);
      this.catelist = res.data.result;
      this.total = res.data.total;
    },
    // 监听pagesize
    handleSizeChange(newsize) {
      this.queryinfo.pagesize = newsize;
      this.getcatelist();
    },
    //监听pagenum
    handleCurrentChange(newpage) {
      this.queryinfo.pagenum = newpage;
      this.getcatelist();
    },
    //展示添加对话框
    showadddialog() {
      this.getparentcatelist();
      this.adddialogVisible = true;
    },
    //获取父级分类的数据列表
    async getparentcatelist() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类失败！");
      }
      //console.log(res.data)
      this.parentcatelist = res.data;
    },
    //选择项发生变化
    parentcatechange() {
      if (this.selectkeys.length > 0) {
        //父级分类id
        this.addcateform.cat_pid = this.selectkeys[this.selectkeys.length - 1];
        this.addcateform.cat_level = this.selectkeys.length;
        return;
      } else {
        this.addcateform.cat_pid = 0;
        this.addcateform.cat_level = 0;
      }
      console.log(this.selectkeys);
    },
    //添加新分类
    addcate() {
      this.$refs.addcateformref.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addcateform
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败！");
        }
        this.$message.success("添加分类成功！");
        this.getcatelist();
        this.adddialogVisible = false;
      });
      //console.log(this.addcateform)
    },
    //关闭对话框
    addcatedialogclose() {
      this.$refs.addcateformref.resetFields();
      this.selectkeys = [];
      this.addcateform.cat_pid = 0;
      this.addcateform.cat_level = 0;
    },
    //展示编辑对话框
    async showeditdialog(id) {
      const { data: res } = await this.$http.get("categories/" + id);
      //console.log(id)
      if (res.meta.status !== 200) {
        return this.$message.error("查询分类信息失败！");
      }

      this.editform = res.data;
      console.log(this.editform);
      this.editdialogVisible = true;
    },
    //关闭修改用户对话框
    editdialogclose() {
      this.$refs.editformref.resetFields();
    },
    //提交修改信息
    edituserinfo() {
      this.$refs.editformref.validate(async (valid) => {
        if (!valid) return;
        const { data: res } =await this.$http.put(
          "categories/" + this.editform.cat_id,
          { cat_name: this.editform.cat_name }
        );
        if (res.meta.status !== 200)
          return this.$message.error("更新分类名称失败！");

        this.editdialogVisible = false;
        this.getcatelist();
        this.$message.success("更新分类名称成功！");
      });
    },
    //删除
    async removebyid(id){
        const result = await this.$confirm(
        "此操作将永久删除该分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => {
        return err;
      });
      if (result !== "confirm") {
        return this.$message.info("已取消删除");
      }

      const { data: res } = await this.$http.delete("categories/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("删除分类失败！");
      }
      this.$message.success("删除分类成功！");
      this.getcatelist()

    }
  },
};
</script>

<style lang='less' scoped>
.treetable {
  margin-top: 15px;
}
</style>